const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// ✅ Store quizzes in memory (use a database in production)
const quizzes = {};

// ✅ Gemini API Details
const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const AI_API_KEY = "AIzaSyB6nz0dIEPKcVq4OSCfH12kau4Z54f1OtM";

app.post("/create-quiz", async (req, res) => {
    try {
        const { topic } = req.body;
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

// ✅ Fetch quiz by ID
app.get("/quiz/:quizId", (req, res) => {
    const { quizId } = req.params;
    if (quizzes[quizId]) {
        res.json(quizzes[quizId]);
    } else {
        res.status(404).json({ success: false, message: "Quiz not found" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
