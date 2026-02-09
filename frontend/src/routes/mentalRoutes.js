import express from "express";
import MentalEntry from "../models/MentalEntry.js";

const router = express.Router();

/*
=====================================
POST: Add daily mental health entry
=====================================
*/
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      daily_screen_time_min,
      sleep_hours,
      mood_score,
      anxiety_level,
      focus_score,
    } = req.body;

    const entry = new MentalEntry({
      userId,
      daily_screen_time_min,
      sleep_hours,
      mood_score,
      anxiety_level,
      focus_score,
      createdAt: new Date(),
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ message: "Failed to save entry" });
  }
});

/*
=====================================
GET: All entries of a user
=====================================
*/
router.get("/:userId", async (req, res) => {
  try {
    const entries = await MentalEntry.find({
      userId: req.params.userId,
    }).sort({ createdAt: 1 });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

/*
=====================================
GET: Dashboard averages
=====================================
*/
router.get("/stats/:userId", async (req, res) => {
  try {
    const stats = await MentalEntry.aggregate([
      { $match: { userId: req.params.userId } },
      {
        $group: {
          _id: null,
          avgMood: { $avg: "$mood_score" },
          avgAnxiety: { $avg: "$anxiety_level" },
          avgSleep: { $avg: "$sleep_hours" },
          avgScreenTime: { $avg: "$daily_screen_time_min" },
        },
      },
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error("Error calculating stats:", error);
    res.status(500).json({ message: "Failed to calculate stats" });
  }
});

export default router;
