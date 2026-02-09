import express from "express";
import MentalEntry from "../models/MentalEntry.js";

const router = express.Router();

// Add entry
router.post("/", async (req, res) => {
  const entry = await MentalEntry.create(req.body);
  res.json(entry);
});

// Get entries for user
router.get("/:userId", async (req, res) => {
  const data = await MentalEntry.find({ userId: req.params.userId });
  res.json(data);
});

export default router;
