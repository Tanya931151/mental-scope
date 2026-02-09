import React from "react";

export default function WeeklyMoodChart({ data = [] }) {
  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h3>Weekly Mood Chart</h3>
      <p>Data points: {data.length}</p>
    </div>
  );
}
