import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { fetchUserProfile, updateUserProfile } from "../../../Redux/userSlice/userSlice";
import type { RootState } from "../../../Redux/store";

interface Certification {
  id: number;
  title: string;
  institution: string;
  year: string;
}

export default function ProfessionalDetails() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state: RootState) => state.user);
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [specialization, setSpecialization] = useState("Internal Medicine");
  const [experience, setExperience] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (profile?.doctorProfile) {
      setSpecialization(profile.doctorProfile.specialization || "Internal Medicine");
      setExperience(profile.doctorProfile.yearsExperience?.toString() || "");
      setLicenseNumber(profile.doctorProfile.medicalLicense || "");
      
      if (profile.doctorProfile.certifications) {
        setCertifications(profile.doctorProfile.certifications.map((cert: any) => ({
          id: cert.id,
          title: String(cert.title ?? ''),
          institution: String(cert.institution ?? ''),
          year: String(cert.year ?? '')
        })));
      }
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        specialization,
        yearsExperience: parseInt(experience) || 0,
        medicalLicense: licenseNumber,
      } as any;
      
      await dispatch(updateUserProfile(updateData)).unwrap();
      // Refresh profile data
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Failed to update professional details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (_id: number) => {
    // Edit certification functionality
  };

  const handleAdd = () => {
    // Add certification functionality
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto"
    >
      <h2 className="text-lg font-semibold mb-4">Professional Details</h2>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Specialization
          </label>
          <select
            name="specialization"
            className="w-full border border-gray-300 rounded-md p-2"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          >
            <option value="Internal Medicine">Internal Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Surgery">Surgery</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Oncology">Oncology</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md p-2"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            min="0"
            max="50"
            required
          />
        </div>
      </div>

      {/* License */}
      <div className="mb-6">
        <label className="block text-sm text-gray-700 mb-1">
          Medical License Number
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          required
        />
      </div>

      {/* Certifications */}
      <div className="mb-6 border border-blue-100 bg-blue-50 p-4 rounded-md">
        <h3 className="font-semibold text-sm mb-4">Certifications & Education</h3>

        <div className="flex flex-col gap-3 mb-4">
          {certifications.length > 0 ? (
            certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border border-gray-200 rounded-md p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{cert.title}</p>
                  <p className="text-sm text-gray-500">
                    {cert.institution} • {cert.year}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(cert.id)}
                  className="text-cyan-600 text-sm hover:underline"
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No certifications added yet.</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full border border-cyan-500 text-cyan-600 rounded-md py-2 text-sm hover:bg-cyan-50"
        >
          + Add Certification
        </button>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
