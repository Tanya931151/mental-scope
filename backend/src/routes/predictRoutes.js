import express from "express";
import { predictEmotion } from "../utils/chatbotEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const predictedEmotion = predictEmotion(text);

        res.json({ emotion: predictedEmotion });
    } catch (error) {
        console.error("Predict route error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
