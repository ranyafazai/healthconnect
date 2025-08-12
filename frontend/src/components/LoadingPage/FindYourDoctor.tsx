// No React import needed
import { Button } from "../ui/button";
import { Search } from "lucide-react";

export function FindYourDoctor() {
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
          <form className="flex flex-col md:flex-row gap-6 items-end">
            {/* Specialty Dropdown */}
            <div className="flex-1 relative">
              <label className="block text-gray-800 font-semibold mb-2">Specialty</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                <option value="">Select Specialty</option>
                <option value="cardiology">Cardiology</option>
                <option value="dermatology">Dermatology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="psychiatry">Psychiatry</option>
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
                placeholder="Enter city or zip code"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto">
              <Button className="w-full md:w-auto text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200" style={{ backgroundColor: '#008CBA' }}>
                <Search className="w-4 h-4" />
                Search Doctors
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
