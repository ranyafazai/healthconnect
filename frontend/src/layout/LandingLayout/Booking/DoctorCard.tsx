import React from "react";
import { Star } from "lucide-react";

export default function DoctorCard() {

  return (
    <div style={{ backgroundColor: "#F8FCFF", borderRadius: "10px", padding: "20px", margin: "40px", boxShadow: "0 7px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <div style={{ marginLeft: "30px", backgroundColor: "#008CBA", color: "white", width: "100px", height: "100px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>
          Dr
        </div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Dr. Sarah Johnson</h2>
          <p style={{ color: "#008CBA", fontWeight: "medium" }}>Cardiologist</p>
          <div style={{ display: "flex", alignItems: "center", fontSize: "14px", marginTop: "5px" }}>
            <span style={{ color: "#FFD700" }}>★★★★★</span>
            <span style={{ color: "#666", fontWeight: "bold", marginLeft: "5px" }}>4.9 (127 reviews)</span>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            15 years experience | New York, NY | Available Today
          </div>
        </div>
      </div>
      <div style={{ color: "#008CBA", fontSize: "18px", fontWeight: "bold" }}>$150</div>
    </div>
  );
};
