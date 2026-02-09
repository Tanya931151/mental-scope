import express from "express";
import MoodEntry from "../models/MoodEntry.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create mood entry
router.post("/", protect, async (req, res) => {
  try {
    const { mood, sleepHours, stressLevel, notes, date } = req.body;

    const entry = await MoodEntry.create({
      user: req.user._id,
      mood,
      sleepHours,
      stressLevel,
      notes,
      date: date || new Date()
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all entries for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ user: req.user._id })
      .sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete one entry
router.delete("/:id", protect, async (req, res) => {
  try {
    const entry = await MoodEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
