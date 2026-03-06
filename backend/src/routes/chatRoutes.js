import express from "express";
import { getResponse } from "../utils/chatbotEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, state } = req.body;

        if (message === "__start__" || message === "start") {
            const response = getResponse("__start__", null);
            return res.json(response);
        }

        const response = getResponse(message, state);
        res.json(response);
    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
