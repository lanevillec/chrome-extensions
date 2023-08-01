const express = require('express');
const cors = require('cors');
const {Configuration, OpenAIApi } = require('openai');
require('dotenv').config()

const app = express();
const port = 3000;
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.post('/organizeTabs', async (req, res) => {
  const { organizePrompt } = req.body;
  console.log('organizeTabs in the server has fired!:' + organizePrompt);

  try {
    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: organizePrompt}],
    })

    console.log('RESPONSE: ' + JSON.stringify(chatCompletion.data.choices[0].message));
    res.json(chatCompletion.data.choices[0].message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
