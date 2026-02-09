import React, { useEffect, useState } from "react";
import axios from "axios";

import StatCard from "../components/StatCard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/mental/tanya123");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Average calculator
  const avg = (key) => {
    if (!data.length) return "--";
    const sum = data.reduce((acc, cur) => acc + (cur[key] || 0), 0);
    return (sum / data.length).toFixed(1);
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Welcome back, Tanya 👋</p>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          title="Wellbeing"
          value={avg("digital_wellbeing_score")}
          icon="😊"
        />
        <StatCard title="Mood" value={avg("mood_score")} icon="🙂" />
        <StatCard title="Anxiety" value={avg("anxiety_level")} icon="😟" />
        <StatCard
          title="Sleep"
          value={avg("sleep_hours")}
          icon="😴"
          unit=" hrs"
        />
      </div>

      {/* MOOD VS ANXIETY */}
      <div className="card">
        <h3>Mood vs Anxiety</h3>

        {data.length === 0 ? (
          <p>No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="createdAt"
                tickFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood_score"
                stroke="#6EE7B7"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="anxiety_level"
                stroke="#F87171"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* SCREEN TIME VS SLEEP */}
      <div className="card">
        <h3>Screen Time vs Sleep</h3>

        {data.length === 0 ? (
          <p>No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="createdAt"
                tickFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="daily_screen_time_min" fill="#60A5FA" />
              <Bar dataKey="sleep_hours" fill="#C084FC" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* INSIGHTS */}
      <div className="card">
        <h3>Insights</h3>
        <p>• Higher screen time often reduces sleep quality</p>
        <p>• Better sleep improves mood and focus</p>
        <p>• Digital wellbeing score correlates with lower anxiety</p>
      </div>
    </div>
  );
}
