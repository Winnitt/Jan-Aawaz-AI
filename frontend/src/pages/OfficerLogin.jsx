import React, { useState } from "react";
import { ShieldCheck, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function OfficerLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Standard demo credentials
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("officer_auth", "true");
      onLogin();
      navigate("/officer");
    } else {
      setError("Invalid Officer ID or Password. Check demo credentials below.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", padding: "20px" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "10px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "50px", height: "50px", backgroundColor: "#1e3a8a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>Municipal Command Center</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Restricted Officer Access</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Officer Username
            </label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px" }}>
              <User size={16} color="#64748b" style={{ marginRight: "8px" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px" }}>
              <Lock size={16} color="#64748b" style={{ marginRight: "8px" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#1e3a8a",
              color: "white",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Authenticate & Open Dashboard
          </button>
        </form>

        {/* Demo Credentials Box for Hackathon Judges
         <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
          <strong>Judge / Demo Credentials:</strong><br />
          Username: <code style={{ color: "#1e3a8a" }}>admin</code><br />
          Password: <code style={{ color: "#1e3a8a" }}>admin123</code>
        </div> */}

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <ArrowLeft size={14} /> Back to Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
}