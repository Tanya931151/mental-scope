// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="hero-left">
        <h1>
          Track your <span>mind</span> like you track your steps.
        </h1>
        <p>
          Mental Scope helps you log moods, sleep and stress, and see how your
          emotional wellbeing changes over time.
        </p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/register")} className="btn-primary">
            Get Started
          </button>
          <button onClick={() => navigate("/login")} className="btn-ghost">
            I already have an account
          </button>
        </div>

        <div className="hero-stats">
          <div>
            <h3>24/7</h3>
            <p>Wellness companion</p>
          </div>
          <div>
            <h3>30 days</h3>
            <p>Mood trends at a glance</p>
          </div>
          <div>
            <h3>Secure</h3>
            <p>Your data, your control</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card-3d">
          <div className="glow-dot"></div>
          <h2>Today’s Check-in</h2>
          <p className="hero-card-sub">
            “How are you feeling right now?”
          </p>
          <div className="hero-mood-row">
            <span>😞</span>
            <span>😐</span>
            <span>🙂</span>
            <span>😄</span>
            <span>🤩</span>
          </div>
          <div className="hero-metric-row">
            <div>
              <p>Sleep</p>
              <h3>7.5 hrs</h3>
            </div>
            <div>
              <p>Stress</p>
              <h3>2 / 5</h3>
            </div>
          </div>
          <button
            className="btn-primary full-width"
            onClick={() => navigate("/register")}
          >
            Start tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
