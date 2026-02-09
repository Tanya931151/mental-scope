import { useState } from "react";
import axios from "axios";

export default function DailyInputForm({ onSuccess }) {
  const [form, setForm] = useState({
    daily_screen_time_min: "",
    sleep_hours: "",
    social_media_time_min: "",
    focus_score: 5,
    mood_score: 5,
    anxiety_level: 5,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/mental", {
      userId: "tanya123",
      ...form,
    });

    onSuccess();
  };

  return (
    <form className="input-card" onSubmit={submit}>
      <h3>📝 Daily Check-in</h3>

      <input
        name="daily_screen_time_min"
        placeholder="Screen time (min)"
        onChange={handleChange}
      />
      <input
        name="sleep_hours"
        placeholder="Sleep hours"
        onChange={handleChange}
      />
      <input
        name="social_media_time_min"
        placeholder="Social media (min)"
        onChange={handleChange}
      />

      <label>Mood: {form.mood_score}</label>
      <input
        type="range"
        min="1"
        max="10"
        name="mood_score"
        onChange={handleChange}
      />

      <label>Anxiety: {form.anxiety_level}</label>
      <input
        type="range"
        min="1"
        max="10"
        name="anxiety_level"
        onChange={handleChange}
      />

      <label>Focus: {form.focus_score}</label>
      <input
        type="range"
        min="1"
        max="10"
        name="focus_score"
        onChange={handleChange}
      />

      <button>Add Entry</button>
    </form>
  );
}
