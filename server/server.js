import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors()); // Allow CORS
app.use(express.json()); // Parse JSON bodies

app.get('/', async (req, res) => {
    res.status(200).send({ // dummy endpoint
        message: 'Hello from CodeX!',
    });
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003", // The model to use
            prompt: `${prompt}`,
            temperature: 0, // The higher the temperature, the more random the completions. Try 0.9 for more fun
            max_tokens: 3000, // How many tokens to generate
            top_p: 1, // 1.0 is the default (conservative) setting. 0.9 may be fun or more creative
            frequency_penalty: 0.5, // How much to penalize new tokens based on their existing frequency in the text so far. Try 0.5 for more creative results
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text, // The bot's response
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));