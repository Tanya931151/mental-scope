import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/2.png";

export default function Register() {
  const NAVBAR_HEIGHT = 72; // px — change if your navbar is different

  const pageStyle = {
    position: "fixed",
    top: `${NAVBAR_HEIGHT}px`,
    left: 0,
    right: 0,
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };

  const card = {
    background: "rgba(0, 25, 32, 0.85)",
    padding: "30px",
    borderRadius: "18px",
    width: "380px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    color: "white",
  };

  const input = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "15px",
    fontSize: "15px",
  };

  const btn = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#e3e3e3",
    cursor: "pointer",
    marginTop: "5px",
  };

  return (
    <div style={pageStyle}>
      <div style={card}>
        <h2 style={{ marginBottom: "20px" }}>Create Account</h2>

        <input type="text" placeholder="Full Name" style={input} />
        <input type="email" placeholder="Email" style={input} />
        <input type="password" placeholder="Password" style={input} />

        <button style={btn}>Sign Up</button>

        <p style={{ marginTop: "15px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7ec4ff" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
