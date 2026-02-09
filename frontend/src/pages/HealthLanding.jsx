import React from "react";
import heroImg from "../assets/picture.jpg"; // put your image at src/assets/hero.jpg

export default function HealthLanding() {
  const root = {
    minHeight: "100vh",
    background: "#FBF7F6",
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#222",
  };

  const heroWrap = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    padding: "60px 5%",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const left = {
    width: "55%",
    zIndex: 2,
  };

  const heading = {
    fontSize: "64px",
    lineHeight: "1.02",
    margin: 0,
    color: "#33364a",
    fontWeight: 800,
  };

  const sub = {
    marginTop: "22px",
    color: "#5b5f6b",
    fontSize: "18px",
    maxWidth: "560px",
  };

  const ctaRow = {
    marginTop: "28px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
  };

  const startBtn = {
    background: "#2f6b67",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  };

  const right = {
    width: "45%",
    position: "relative",
    display: "flex",
    justifyContent: "flex-end",
  };

  const heroCard = {
    width: "780px",
    height: "420px",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 18px 50px rgba(20,20,20,0.15)",
    backgroundImage: `url(${heroImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center right",
  };

  const banner = {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.0)",
  };

  return (
    <div style={root}>
      {/* Navbar is optional — App will mount Navbar if you add it */}
      <div style={heroWrap}>
        <div style={left}>
          <h1 style={heading}>Mental Health Starts with You</h1>
          <p style={sub}>
            Mental Scope supports you on your journey toward better mental
            health. Short exercises, daily reflections and guided content to
            build healthier habits.
          </p>

          <div style={ctaRow}>
            <button style={startBtn}>Get Started — Free</button>
            <a
              href="#features"
              style={{
                color: "#5b5f6b",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Learn more
            </a>
          </div>
        </div>

        <div style={right}>
          <div style={heroCard}>
            <div style={banner}></div>
          </div>
        </div>
      </div>

      {/* Minimal features section */}
      <section
        id="features"
        style={{ padding: "40px 5%", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ display: "flex", gap: "22px", alignItems: "stretch" }}>
          <Feature
            title="Daily Check-ins"
            desc="Quick questions you can answer in under a minute"
          />
          <Feature
            title="Guided Exercises"
            desc="Short activities grounded in CBT and mindfulness"
          />
          <Feature
            title="Personal Insights"
            desc="Automatic visualizations of mood trends"
          />
        </div>
      </section>

      <footer
        style={{
          padding: "40px 5%",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>Ready to start tracking?</h4>
            <p style={{ margin: 0, color: "#666" }}>
              Create a free account and begin a short mood check-in today.
            </p>
          </div>
          <a href="/register" style={{ ...startBtn, padding: "12px 20px" }}>
            Create free account
          </a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(15,15,15,0.06)",
        flex: 1,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "8px" }}>{title}</div>
      <div style={{ color: "#666" }}>{desc}</div>
    </div>
  );
}
