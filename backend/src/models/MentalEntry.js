import mongoose from "mongoose";

const mentalSchema = new mongoose.Schema({
  userId: String,
  date: { type: Date, default: Date.now },
  mood: Number,
  anxiety: Number,
  sleepHours: Number,
  screenTime: Number,
});

export default mongoose.model("MentalEntry", mentalSchema);
