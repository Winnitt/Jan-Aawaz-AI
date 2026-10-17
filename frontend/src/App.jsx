import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CitizenPortal from "./pages/CitizenPortal";
import OfficerLogin from "./pages/OfficerLogin";
import OfficerDashboard from "./pages/OfficerDashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("officer_auth") === "true"
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Citizen Portal */}
        <Route path="/" element={<CitizenPortal />} />

        {/* Officer Login */}
        <Route
          path="/login"
          element={<OfficerLogin onLogin={() => setIsAuthenticated(true)} />}
        />

        {/* Protected Officer Dashboard */}
        <Route
          path="/officer"
          element={
            isAuthenticated ? (
              <OfficerDashboard onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}