// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const nav = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 5%",
    background: "#f5eaea",
    borderBottom: "1px solid rgba(0,0,0,0.03)",
  };

  return (
    <header style={nav}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <img
          src={logo}
          alt="Mental Scope"
          style={{ width: 44, height: 44, borderRadius: 8 }}
        />
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
        >
          <span style={{ fontWeight: 700, color: "#2f6b67", fontSize: 16 }}>
            Mental Scope
          </span>
          <span style={{ fontSize: 12, color: "#6b6f75" }}>Health Tracker</span>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link to="/" style={{ color: "#333", textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/signup" style={{ color: "#333", textDecoration: "none" }}>
          Sign Up
        </Link>
        <Link to="/login" style={{ color: "#333", textDecoration: "none" }}>
          Log in
        </Link>
      </nav>
    </header>
  );
}
