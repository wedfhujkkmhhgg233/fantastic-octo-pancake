import express from 'express';
import axios from 'axios';
import fs from 'fs-extra';

const router = express.Router();
const key = "KK9Q6W-RPRTXQX2RY"; // New WolframAlpha API key

const serviceMetadata = {
  name: 'Math Calculator',
  author: 'Jerome',
  description: 'Perform various math operations like solving equations, plotting graphs, and more.',
  category: 'Others',
  link: ['/api/math?prompt=1+1']
};

// Function to handle WolframAlpha queries
async function wolframQuery(query) {
  try {
    const res = await axios.get(`http://api.wolframalpha.com/v2/query?appid=${key}&input=${encodeURIComponent(query)}&output=json`);
    return res.data.queryresult;
  } catch (error) {
    throw new Error('Error querying WolframAlpha API: ' + error.message);
  }
}

// Route to handle math operations (calculation, graphing, etc.)
router.get('/math', async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({
      error: 'Please provide a search query with the "prompt" parameter.',
      metadata: serviceMetadata
    });
  }

  let responseJson = {
    metadata: serviceMetadata,
    data: null,
  };

  try {
    if (prompt.indexOf('-p') === 0) {
      // Handle primitive calculation or integration
      const content = "primitive " + prompt.slice(3);
      const result = await wolframQuery(content);
      responseJson.data = result.pods.find(pod => pod.id === 'IndefiniteIntegral')?.subpods[0].plaintext || 'No result found';
    } else if (prompt.indexOf('-g') === 0) {
      // Handle graph plotting
      const content = "plot " + prompt.slice(3);
      const result = await wolframQuery(content);
      const plotSrc = result.pods.find(pod => pod.id === 'Plot')?.subpods[0].img.src || result.pods.find(pod => pod.id === 'ImplicitPlot')?.subpods[0].img.src;
      
      if (plotSrc) {
        const img = (await axios.get(plotSrc, { responseType: 'stream' })).data;
        img.pipe(fs.createWriteStream('./graph.png')).on('close', () => {
          res.json({ body: 'Graph Image:', attachment: fs.createReadStream('./graph.png') });
          fs.unlinkSync('./graph.png');
        });
        return;
      }
      responseJson.data = 'No graph found';
    } else if (prompt.indexOf('-v') === 0) {
      // Handle vector operations
      const content = "vector " + prompt.slice(3).replace(//g, "<").replace(//g, ">");
      const result = await wolframQuery(content);
      const vectorLength = result.pods.find(pod => pod.id === 'VectorLength')?.subpods[0].plaintext || 'N/A';
      const vectorResult = result.pods.find(pod => pod.id === 'Result')?.subpods[0].plaintext || 'No result found';

      responseJson.data = `${vectorResult}\nVector Length: ${vectorLength}`;
    } else {
      // Default math operations (solving equations, etc.)
      const result = await wolframQuery(prompt);
      const solution = result.pods.find(pod => pod.id === 'Solution');
      
      if (solution) {
        responseJson.data = solution.subpods.map(subpod => subpod.plaintext).join("\n");
      } else {
        responseJson.data = 'No solution found';
      }
    }

    // Send the response as a pretty-printed JSON string
    res.json(JSON.parse(JSON.stringify(responseJson, null, 2)));
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve data from WolframAlpha.',
      details: error.message
    });
  }
});

export { router, serviceMetadata };
