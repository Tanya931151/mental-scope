import { useState } from "react";
import axios from "axios";
import DailyEntryForm from "../components/DailyEntryForm";

export default function DailyEntryForm({ onAdd }) {
  const [form, setForm] = useState({
    daily_screen_time_min: "",
    sleep_hours: "",
    mood_score: "",
    anxiety_level: "",
    focus_score: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitEntry = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/mental", {
      userId: "tanya123",
      ...form,
    });

    setForm({
      daily_screen_time_min: "",
      sleep_hours: "",
      mood_score: "",
      anxiety_level: "",
      focus_score: "",
    });

    onAdd(); // refresh dashboard
  };

  return (
    <form className="card" onSubmit={submitEntry}>
      <h3>Add Today’s Entry</h3>

      <input
        name="daily_screen_time_min"
        placeholder="Screen Time (minutes)"
        value={form.daily_screen_time_min}
        onChange={handleChange}
        required
      />

      <input
        name="sleep_hours"
        placeholder="Sleep Hours"
        value={form.sleep_hours}
        onChange={handleChange}
        required
      />

      <input
        name="mood_score"
        placeholder="Mood (0–10)"
        value={form.mood_score}
        onChange={handleChange}
        required
      />

      <input
        name="anxiety_level"
        placeholder="Anxiety (0–10)"
        value={form.anxiety_level}
        onChange={handleChange}
        required
      />

      <input
        name="focus_score"
        placeholder="Focus (0–10)"
        value={form.focus_score}
        onChange={handleChange}
        required
      />

      <button type="submit">Save Entry</button>
    </form>
  );
}
