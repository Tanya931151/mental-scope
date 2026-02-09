// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import signupImg from "../assets/3.png"; // <--- YOUR IMAGE HERE

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const container = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#f3b3d9 0%, #c7e1ff 100%)",
    padding: 24,
    fontFamily: "Inter, system-ui",
  };

  const card = {
    width: "100%",
    maxWidth: 980,
    height: 520,
    display: "flex",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 30px 60px rgba(23,23,23,0.15)",
    background: "#fff",
  };

  const left = {
    width: "44%",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const right = {
    width: "56%",
    backgroundImage: `url(${signupImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const title = {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    color: "#111827",
  };

  const subtitle = {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.5,
  };

  const googleBtn = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e6e6e6",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 600,
    width: "100%",
  };

  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #e6e6e6",
    marginBottom: 12,
    fontSize: 14,
  };

  const continueBtn = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    background: "#5b2df5",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  };

  const small = {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 12,
  };

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/login");
  }

  return (
    <div style={container}>
      <div style={card}>
        {/* LEFT : FORM */}
        <div style={left}>
          <h2 style={title}>Sign up</h2>
          <p style={subtitle}>
            Create an account to begin your wellbeing journey.
          </p>

          <button
            style={googleBtn}
            onClick={() => alert("Google Sign-in placeholder")}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "#f3f4f6",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              G
            </div>
            Sign up with Google
          </button>

          {/* OR */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "18px 0",
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#eee" }}></div>
            or
            <div style={{ flex: 1, height: 1, background: "#eee" }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              style={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              style={input}
              required
            />

            <button type="submit" style={continueBtn}>
              Continue
            </button>
          </form>

          <p style={small}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#5b2df5", fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>

        {/* RIGHT IMAGE PANEL */}
        <div style={right}></div>
      </div>
    </div>
  );
}
