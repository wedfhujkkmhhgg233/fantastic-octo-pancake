import axios from "axios";
import { unescape } from "querystring";

const headers = {
  "Content-Type": "application/json",
};

class GmailNator {
  constructor(proxy = null) {
    this.session = axios.create({
      baseURL: "https://emailnator.com",
      headers,
      proxy,
    });
  }

  async init() {
    const response = await this.session.get("/");
    if (response.status === 403) {
      throw new Error("CloudflareDetect: Access forbidden.");
    }
  }

  async getXsrfToken() {
    const cookies = this.session.defaults.jar?.getCookies("https://emailnator.com");
    const tokenCookie = cookies.find((cookie) => cookie.key === "XSRF-TOKEN");
    if (!tokenCookie) {
      throw new Error("CloudflareDetect: XSRF token not found.");
    }
    return unescape(tokenCookie.value);
  }

  async getEmailOnline(useCustomDomain = true, usePlus = true, usePoint = true) {
    const data = ["domain", "plusGmail", "dotGmail"];
    const payload = {
      email: data.filter((_, idx) => [useCustomDomain, usePlus, usePoint][idx]),
    };

    const token = await this.getXsrfToken();
    const response = await this.session.post(
      "/generate-email",
      payload,
      {
        headers: { ...headers, "x-xsrf-token": token },
      }
    );

    if (response.status === 200) {
      return response.data.email[0];
    }

    throw new Error("ProblemWithGetEmail: Unable to fetch email.");
  }

  async getInbox(email) {
    const payload = { email };
    const token = await this.getXsrfToken();

    const response = await this.session.post(
      "/message-list",
      payload,
      {
        headers: { ...headers, "x-xsrf-token": token },
      }
    );

    if (response.status === 200) {
      return response.data.messageData
        .filter((msg) => !msg.messageID.includes("ADS"))
        .map((msg) => new Letter(email, msg, token, this.session));
    }

    return [];
  }
}

class Letter {
  constructor(to, content, token, session) {
    this.to = to;
    this.name = content.from.includes("<")
      ? content.from.split("<")[0].trim()
      : content.from;
    this.from = content.from.includes("<")
      ? content.from.split("<")[1].replace(">", "").trim()
      : content.from;
    this.subject = content.subject;
    this.messageID = content.messageID;
    this.token = token;
    this.session = session;
  }

  async fetchContent() {
    const payload = { email: this.to, messageID: this.messageID };
    const response = await this.session.post(
      "/message-list",
      payload,
      {
        headers: { ...headers, "x-xsrf-token": this.token },
      }
    );

    if (response.status === 200) {
      return response.data.text.replace(header_regex, "");
    }
    throw new Error("Unable to fetch letter content.");
  }
}

export default GmailNator;
