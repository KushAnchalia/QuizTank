const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// ✅ Store quizzes and stakes in memory (use a database in production)
const quizzes = {};
const stakes = {};

// ✅ Gemini API Details
const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const AI_API_KEY = "AIzaSyB6nz0dIEPKcVq4OSCfH12kau4Z54f1OtM"; // ⚠️ Consider moving this to an environment variable

/**
 * Route: Create a quiz based on a given topic
 */
app.post("/create-quiz", async (req, res) => {
    try {
        const { topic } = req.body;

        // ✅ Validate input
        if (!topic || typeof topic !== "string") {
            return res.status(400).json({ success: false, message: "Invalid topic provided" });
        }

        const response = await axios.post(
            `${AI_API_URL}?key=${AI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: `Generate a JSON quiz about ${topic}. Format it as an array of objects with "question", "options", and "answer" fields.` }]
                }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        let rawText = response.data.candidates[0].content.parts[0].text;

        // ✅ Remove Markdown formatting
        rawText = rawText.replace(/```json|```/g, "").trim();

        const quizData = JSON.parse(rawText);
        const quizId = Date.now().toString(); // Generate a unique ID

        quizzes[quizId] = quizData; // ✅ Store quiz in memory

        res.json({ success: true, quizId });
    } catch (error) {
        console.error("❌ Error generating quiz:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

/**
 * Route: Fetch quiz by ID
 */
app.get("/quiz/:quizId", (req, res) => {
    const { quizId } = req.params;
    if (quizzes[quizId]) {
        res.json(quizzes[quizId]);
    } else {
        res.status(404).json({ success: false, message: "Quiz not found" });
    }
});

/**
 * Route: Stake amount using MetaMask wallet address
 */
app.post("/stake", (req, res) => {
    try {
        const { address, amount } = req.body;

        // ✅ Input validation
        if (!address || !amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid stake data" });
        }

        // ✅ Store stake
        if (!stakes[address]) {
            stakes[address] = 0;
        }
        stakes[address] += parseFloat(amount);

        console.log(`✅ Staked ${amount} for ${address}`);
        res.json({ success: true, message: `Successfully staked ${amount} tokens!` });
    } catch (error) {
        console.error("❌ Error processing stake:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

/**
 * Route: Get staked amount for a wallet
 */
app.get("/stake/:address", (req, res) => {
    const { address } = req.params;
    if (stakes[address]) {
        res.json({ success: true, stakedAmount: stakes[address] });
    } else {
        res.json({ success: false, message: "No stakes found for this address" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
