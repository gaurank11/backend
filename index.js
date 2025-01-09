const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Generating Outline Endpoint
app.post('/generate-outline', async (req, res) => {
    const { title } = req.body;

    try {
        const response = await openai.createCompletion({
            model: 'gpt-4',
            prompt: `Generate an outline for an article or blog titled "${title}". Include these headings: Introduction, Types of Renewable Energy, Benefits of Sustainable Energy, Challenges in Adoption, Role of Technology in Sustainable Energy, Conclusion.`,
            max_tokens: 300,
        });
        res.json({ outline: response.data.choices[0].text.trim().split("\n") });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Generate Content in Parallel
app.post('/generate-content', async (req, res) => {
    const { outline } = req.body;

    try {
        const contentPromises = outline.map((heading) =>
            openai.createCompletion({
                model: 'gpt-4',
                prompt: `Write detailed content for the heading: "${heading}".`,
                max_tokens: 500,
            })
        );
        const responses = await Promise.all(contentPromises);
        const content = responses.map((response) => response.data.choices[0].text.trim());
        res.json({ content });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
