// No React import needed
// import { Star } from "lucide-react";
import type { DoctorProfile } from '../../../types/data/doctor';
import { getUploadedFileUrl } from '../../../utils/fileUrl';

interface DoctorCardProps {
  doctor?: DoctorProfile;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  if (!doctor) {
    return (
      <div style={{ backgroundColor: "#F8FCFF", borderRadius: "10px", padding: "20px", margin: "40px", boxShadow: "0 7px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading doctor information...</p>
      </div>
    );
  }

  const getDoctorInitials = (doctor: DoctorProfile) => {
    return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
  };

  const getConsultationPrice = (doctor: DoctorProfile) => {
    const basePrice = 120;
    const experienceMultiplier = Math.min(doctor.yearsExperience / 10, 1.5);
    const specializationMultiplier = doctor.specialization.toLowerCase().includes('surgeon') ? 1.8 : 1.2;
    
    return Math.round(basePrice * experienceMultiplier * specializationMultiplier);
  };

  return (
    <div style={{ backgroundColor: "#F8FCFF", borderRadius: "10px", padding: "20px", margin: "40px", boxShadow: "0 7px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <div style={{ marginLeft: "30px", width: "100px", height: "100px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", overflow: "hidden" }}>
          {doctor.photo ? (
            <img
              src={getUploadedFileUrl(doctor.photo)}
              alt={`${doctor.firstName} ${doctor.lastName}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ backgroundColor: "#008CBA", color: "white", width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>
              {getDoctorInitials(doctor)}
            </div>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          <p style={{ color: "#008CBA", fontWeight: "medium" }}>{doctor.specialization}</p>
          <div style={{ display: "flex", alignItems: "center", fontSize: "14px", marginTop: "5px" }}>
            <span style={{ color: "#FFD700" }}>★★★★★</span>
            <span style={{ color: "#666", fontWeight: "bold", marginLeft: "5px" }}>
              {doctor.avgReview?.toFixed(1) || '0.0'} (127 reviews)
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            {doctor.yearsExperience} years experience | {doctor.city}, {doctor.state} | Available Today
          </div>
        </div>
      </div>
      <div style={{ color: "#008CBA", fontSize: "18px", fontWeight: "bold" }}>
        ${getConsultationPrice(doctor)}
      </div>
    </div>
  );
};

