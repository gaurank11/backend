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

app.get('/', (req, res) => {
    res.send('Welcome to the Blog Generator API!');
});
// Generating Outline Endpoint
app.post('/generate-outline', async (req, res) => {
    const { title } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that creates blog outlines.`,
                },
                {
                    role: 'user',
                    content: `Generate an outline for an article or blog titled "${title}". Include these headings: Introduction, Types, Benefits, Challenges in Adoption, Role of Technology, Conclusion.`,
                },
            ],
            max_tokens: 3000,
        });
        const rawOutline = response.choices[0].message.content.trim().split("\n");
        const outline = rawOutline.filter((line) => line.trim() !== ""); // Remove empty lines
        res.json({ outline });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



// Generate Content in Parallel
app.post('/generate-content', async (req, res) => {
    const { outline } = req.body;

    try {
        const contentPromises = outline.map((heading) =>
            openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a detailed content writer.`,
                    },
                    {
                        role: 'user',
                        content: `Write detailed content for the heading: "${heading}".`,
                    },
                ],
                max_tokens: 10000,
            })
        );
        const responses = await Promise.all(contentPromises);
        const content = responses.map((response) => response.choices[0].message.content.trim());
        res.json({ content });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
