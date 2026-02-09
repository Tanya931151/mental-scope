// src/components/DashboardNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function DashboardNavbar() {
  const bar = {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "14px 5%",
    background:
      "linear-gradient(90deg, rgba(10,30,30,1) 0%, rgba(18,32,35,1) 100%)",
    color: "#e6f6f3",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };

  const brand = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginRight: "auto",
  };

  const logoStyle = {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#123d3a",
  };

  const linkStyle = (active) => ({
    color: active ? "#bfe7db" : "#d6efe8",
    textDecoration: "none",
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 8,
    background: active ? "rgba(255,255,255,0.02)" : "transparent",
  });

  // Note: active highlighting by pathname isn't automatic here;
  // You can add useLocation and compare pathname to set active=true if desired.

  return (
    <header style={bar}>
      <div style={brand}>
        <div style={logoStyle} />
        <div>
          <div style={{ fontWeight: 700, color: "#dff7f2" }}>Wellness</div>
          <div style={{ fontSize: 12, color: "rgba(223,247,242,0.7)" }}>
            Dashboard
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/dashboard" style={linkStyle(false)}>
          Dashboard
        </Link>
        <Link to="/map" style={linkStyle(false)}>
          Map
        </Link>
        <Link to="/facts" style={linkStyle(false)}>
          Facts
        </Link>
        <Link to="/chatbot" style={linkStyle(false)}>
          Chatbot
        </Link>
      </nav>
    </header>
  );
}
