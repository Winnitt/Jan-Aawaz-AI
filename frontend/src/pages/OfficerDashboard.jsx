import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://jan-aawaz-backend-713485855539.asia-south1.run.app";

export default function OfficerDashboard({ onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total_complaints: 0, by_category: {}, by_urgency: {} });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/complaints`),
        fetch(`${API_BASE}/api/dashboard/stats`),
      ]);
      const listData = await listRes.json();
      const statsData = await statsRes.json();
      setComplaints(listData);
      setStats(statsData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("officer_auth");
    onLogout();
    navigate("/login");
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
      {/* Officer Header */}
      <header className="app-header officer-header">
        <div>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>KDMC Command Center</h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Real-Time Civic Hotspots</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={loadData}
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "white",
              padding: "6px 10px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              border: "none",
              color: "white",
              padding: "6px 10px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* KPI Cards (2x2 on Mobile, 4x1 on Desktop) */}
        <div className="kpi-grid">
          <div className="card">
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Total Grievances</p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", color: "#0f172a" }}>{stats.total_complaints}</h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Critical / High</p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", color: "#ef4444" }}>
              {(stats.by_urgency.Critical || 0) + (stats.by_urgency.High || 0)}
            </h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Top Sector</p>
            <h3 style={{ margin: "2px 0 0", fontSize: "15px", color: "#2563eb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {Object.keys(stats.by_category).length > 0
                ? Object.entries(stats.by_category).sort((a, b) => b[1] - a[1])[0][0]
                : "None"}
            </h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>AI SLA</p>
            <h3 style={{ margin: "2px 0 0", fontSize: "16px", color: "#10b981" }}>&lt; 2s Triage</h3>
          </div>
        </div>

        {/* Hotspot Geospatial Map */}
        <div className="card" style={{ marginBottom: "16px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#0f172a" }}>
            <MapPin size={16} color="#ef4444" /> Live Civic Cluster Hotspots
          </h3>
          <div className="map-box">
            <MapContainer center={[19.2184, 73.0867]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {complaints
                .filter((c) => c.latitude && c.longitude)
                .map((c) => (
                  <CircleMarker
                    key={c.id}
                    center={[c.latitude, c.longitude]}
                    radius={11}
                    pathOptions={{
                      fillColor: getUrgencyColor(c.urgency),
                      color: getUrgencyColor(c.urgency),
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <strong>{c.category}</strong>
                      <br />
                      <span style={{ color: getUrgencyColor(c.urgency), fontWeight: "bold" }}>
                        Urgency: {c.urgency}
                      </span>
                      <p style={{ margin: "4px 0", fontSize: "12px" }}>{c.summary}</p>
                      <small style={{ color: "#64748b" }}>Spot: {c.extracted_location || "N/A"}</small>
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </div>
        </div>

        {/* Responsive Feed Table with Horizontal Touch Scroll */}
        <div className="card">
          <h3 style={{ margin: "0 0 12px", fontSize: "14px" }}>Recent Grievance Submissions</h3>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "550px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "8px" }}>ID</th>
                  <th style={{ padding: "8px" }}>Lang</th>
                  <th style={{ padding: "8px" }}>Category</th>
                  <th style={{ padding: "8px" }}>Priority</th>
                  <th style={{ padding: "8px" }}>AI Summary</th>
                  <th style={{ padding: "8px" }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>#{c.id}</td>
                    <td style={{ padding: "8px" }}>{c.original_language}</td>
                    <td style={{ padding: "8px" }}>{c.category}</td>
                    <td style={{ padding: "8px" }}>
                      <span style={{ color: getUrgencyColor(c.urgency), fontWeight: "bold" }}>
                        {c.urgency}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>{c.summary}</td>
                    <td style={{ padding: "8px" }}>{c.extracted_location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}