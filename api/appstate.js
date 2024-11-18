import express from 'express';
import { chromium } from 'playwright-chromium';  // Use playwright-chromium
import ProxyChain from 'proxy-chain';
import path from 'path';
import freeport from 'freeport';

const router = express.Router();
let browser;

// Function to initialize the browser with a proxy
async function initializeBrowser(proxyPort) {
    return chromium.launch({
        headless: false,  // Set to true if you want headless mode
        args: [
            '--ignore-certificate-errors',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--single-process',
            '--no-zygote',
            `--proxy-server=127.0.0.1:${proxyPort}`
        ]
    });
}

// Function to find a free port
async function findFreePort() {
    return new Promise((resolve, reject) => {
        freeport((err, port) => {
            if (err) {
                reject(err);
            } else {
                resolve(port);
            }
        });
    });
}

// Function to login to Facebook
async function loginToFacebook(email, password, proxyPort) {
    browser = await initializeBrowser(proxyPort);
    let page = await browser.newPage();

    await page.goto('https://www.facebook.com/');
    await page.fill('#email', email);  // Fill in the email field
    await page.fill('#pass', password);  // Fill in the password field

    // Click the login button
    await Promise.all([
        page.click('[name="login"]'),
        page.waitForNavigation({ waitUntil: 'networkidle' }), // Wait for navigation to complete
    ]);

    let cookies = await page.context().cookies();  // Playwright's API to get cookies

    let loginFailed = await page.$('input[name="email"]');
    if (loginFailed) {
        await browser.close();
        return { error: 'Wrong username or password. Please try again.' };
    }

    let cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    await browser.close();

    let jsonCookies = cookies.map(cookie => ({
        domain: cookie.domain,
        expirationDate: cookie.expires,
        hostOnly: cookie.hostOnly,
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        session: cookie.session,
        storeId: cookie.storeId,
        value: cookie.value
    }));

    let datrCookie = cookies.find(cookie => cookie.name === 'datr') || {};
    let responseWithDatr = {
        cookies: cookieString,
        jsonCookies,
        datr: datrCookie.value || null
    };

    return responseWithDatr;
}

// Function to start the proxy server
async function startProxy() {
    let proxyPort = await findFreePort();
    let proxyServer = new ProxyChain.Server({ port: proxyPort });

    return new Promise((resolve, reject) => {
        proxyServer.listen((err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Proxy server started on port ${proxyPort}`);
                resolve({ proxyPort, proxyServer });
            }
        });
    });
}

// Router to handle the login API
router.get('/appstate', async (req, res) => {
    const { e: email, p: password } = req.query;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        let proxyPort = await findFreePort();
        let result = await loginToFacebook(email, password, proxyPort);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'An error occurred during the login process.' });
    }
});

// Service Metadata
const serviceMetadata = {
    name: 'Facebook Appstate Getter',
    author: 'Jerome',
    description: 'Logs in to Facebook using Playwright with a proxy server and returns login status along with cookies.',
    category: 'Others',
    link: ["/api/appstate?e=email&p=password"] // Relative link to the endpoint
};

// Export the router and metadata
export { router, serviceMetadata };
