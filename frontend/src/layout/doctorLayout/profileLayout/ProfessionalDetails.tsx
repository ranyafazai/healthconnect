import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface Certification {
  id: number;
  title: string;
  institution: string;
  year: string;
}

export default function ProfessionalDetails() {
  const [specialization, setSpecialization] = useState("Internal Medicine");
  const [experience, setExperience] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      title: "Doctor of Medicine (MD)",
      institution: "Harvard Medical School",
      year: "2008",
    },
    {
      id: 2,
      title: "Board Certification - Internal Medicine",
      institution: "American Board of Internal Medicine",
      year: "2012",
    },
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({
      specialization,
      experience,
      licenseNumber,
      certifications,
    });
  };

  const handleEdit = (id: number) => {
    alert(`Edit certification with id: ${id}`);
  };

  const handleAdd = () => {
    alert("Open add certification modal/form");
  };

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
          >
            <option value="Internal Medicine">Internal Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Surgery">Surgery</option>
            <option value="Psychiatry">Psychiatry</option>
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
        />
      </div>

      {/* Certifications */}
      <div className="mb-6 border border-blue-100 bg-blue-50 p-4 rounded-md">
        <h3 className="font-semibold text-sm mb-4">Certifications & Education</h3>

        <div className="flex flex-col gap-3 mb-4">
          {certifications.map((cert) => (
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
          ))}
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
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
