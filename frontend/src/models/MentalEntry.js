import mongoose from "mongoose";

const MentalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  daily_screen_time_min: Number,
  sleep_hours: Number,
  mood_score: Number,
  anxiety_level: Number,
  focus_score: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("MentalEntry", MentalEntrySchema);
