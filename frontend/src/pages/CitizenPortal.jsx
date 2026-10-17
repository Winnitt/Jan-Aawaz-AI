import React, { useState } from "react";
import { Mic, MicOff, Send, CheckCircle, Globe, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "https://jan-aawaz-backend-713485855539.asia-south1.run.app";

export default function CitizenPortal() {
  const [complaintText, setComplaintText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState("hi-IN");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleVoiceToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setComplaintText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setLoading(true);
    setAiResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: complaintText }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
        setComplaintText("");
      }
    } catch (err) {
      alert("Failed to connect to backend server. Is uvicorn running?");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical": return "#ef4444";
      case "High": return "#f97316";
      case "Medium": return "#eab308";
      default: return "#10b981";
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Mobile-Friendly Header */}
      <header className="app-header">
        <div>
          <h1 style={{ margin: 0, fontSize: "17px", fontWeight: "bold" }}>Jan-Awaz (जन-आवाज़)</h1>
          <p style={{ margin: 0, fontSize: "11px", opacity: 0.85 }}>Citizen Grievance Portal</p>
        </div>
        <Link
          to="/officer"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "12px",
            border: "1px solid rgba(255,255,255,0.4)",
            padding: "6px 10px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 500,
          }}
        >
          <ShieldCheck size={14} /> Officer View
        </Link>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="grid-responsive-2col">
          {/* Submission Card */}
          <div className="card">
            <h2 style={{ fontSize: "16px", marginTop: 0, display: "flex", alignItems: "center", gap: "8px", color: "#1e3a8a" }}>
              <Globe size={18} color="#2563eb" /> Record Grievance
            </h2>

            {/* Language Selector */}
            <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Voice Language:</span>
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="touch-select"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="hi-IN">हिन्दी (Hindi)</option>
                <option value="mr-IN">मराठी (Marathi)</option>
                <option value="en-IN">English</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
              </select>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Speak or type grievance with landmark... (e.g. डोंबिवली पूर्वेला सागाव रोडवर मोठे खड्डे पडले आहेत)"
                className="touch-input"
                style={{ resize: "vertical" }}
              />

              {/* Action Buttons: Stack on tiny screens, side-by-side on normal mobile */}
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`btn-voice ${isListening ? "listening" : ""}`}
                  style={{ flex: "0 0 auto" }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  {isListening ? "Listening..." : "Speak"}
                </button>

                <button
                  type="submit"
                  disabled={loading || !complaintText.trim()}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  <Send size={18} />
                  {loading ? "Analyzing..." : "Submit Grievance"}
                </button>
              </div>
            </form>
          </div>

          {/* AI Result Card */}
          <div>
            {aiResult ? (
              <div
                className="card"
                style={{
                  borderLeft: `5px solid ${getUrgencyColor(aiResult.urgency)}`,
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "16px", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle color="#10b981" size={18} /> Grievance Registered!
                </h3>

                <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                    {aiResult.original_language}
                  </span>
                  <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                    {aiResult.category}
                  </span>
                  <span style={{ backgroundColor: getUrgencyColor(aiResult.urgency), color: "white", padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                    {aiResult.urgency}
                  </span>
                </div>

                <div style={{ marginBottom: "10px", fontSize: "13px" }}>
                  <strong style={{ color: "#334155" }}>English Translation:</strong>
                  <p style={{ margin: "2px 0 0", color: "#64748b" }}>{aiResult.english_translation}</p>
                </div>

                <div style={{ marginBottom: "10px", fontSize: "13px" }}>
                  <strong style={{ color: "#334155" }}>Executive Summary:</strong>
                  <p style={{ margin: "2px 0 0", color: "#64748b" }}>{aiResult.summary}</p>
                </div>

                <div style={{ fontSize: "13px" }}>
                  <strong style={{ color: "#334155" }}>Incident Locality:</strong>
                  <p style={{ margin: "2px 0 0", color: "#2563eb", fontWeight: 600 }}>
                    📍 {aiResult.extracted_location || "Dombivli / Kalyan Ward"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  border: "2px dashed #cbd5e1",
                  textAlign: "center",
                  color: "#64748b",
                  padding: "32px 16px",
                }}
              >
                <AlertTriangle size={32} style={{ margin: "0 auto 8px", display: "block", color: "#94a3b8" }} />
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Speak or type a grievance in Hindi, Marathi, or English. Jan-Awaz will auto-triage and pin the incident location live.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}