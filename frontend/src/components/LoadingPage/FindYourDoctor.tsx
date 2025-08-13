import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../Redux/hooks";
import { setFilters } from "../../Redux/doctorSlice/doctorSlice";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

export function FindYourDoctor() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    specialization: "",
    location: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Available specialties from the backend
  const specialties = [
    "Cardiology",
    "Family Medicine",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Oncology",
    "Psychiatry",
    "Orthopedics",
    "Endocrinology",
    "Gastroenterology",
    "Ophthalmology",
    "Urology",
    "Gynecology",
    "Pulmonology",
    "Rheumatology"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update Redux filters
      const newFilters = {
        specialty: formData.specialization || 'All Specialties',
        city: formData.location || 'All Cities',
        minRating: 'Any Rating',
        availability: 'Any Availability'
      };
      
      dispatch(setFilters(newFilters));

      // Navigate to search results page
      navigate('/search');
      

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Your Doctor</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for specialists by location and specialty to find the perfect healthcare provider for your needs.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 items-end">
            {/* Specialty Dropdown */}
            <div className="flex-1 relative">
              <label className="block text-gray-800 font-semibold mb-2">Specialty</label>
              <select 
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Select Specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Location Input */}
            <div className="flex-1">
              <label className="block text-gray-800 font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter city or zip code"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: '#008CBA' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Doctors
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
