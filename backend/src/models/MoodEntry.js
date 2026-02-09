import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    mood: { type: Number, min: 1, max: 5, required: true }, // 1–very low, 5–very good
    sleepHours: { type: Number, min: 0, max: 24 },
    stressLevel: { type: Number, min: 1, max: 5 },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("MoodEntry", moodEntrySchema);
