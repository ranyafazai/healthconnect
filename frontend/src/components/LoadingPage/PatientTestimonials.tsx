import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PatientTestimonials() {
  const [currentSlide, setCurrentSlide] = useState(1);

  const handlePrevious = () => {
    setCurrentSlide(currentSlide === 1 ? 3 : currentSlide - 1);
  };

  const handleNext = () => {
    setCurrentSlide(currentSlide === 3 ? 1 : currentSlide + 1);
  };

  return (
    <section className="w-full py-16">
      <div className="max-w-4xl mx-auto ">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Patients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied patients who have experienced the convenience and quality of virtual healthcare.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-600 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-600 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Card */}
          <div className="bg-gray-50 rounded-3xl shadow-lg p-12 relative" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Pagination Dots */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentSlide === 1 ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentSlide === 2 ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentSlide === 3 ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {/* Central Icon - positioned to overlap bottom edge */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center relative" style={{ marginTop: '2rem', marginBottom: '-3rem' }}>
                <span className="text-white font-bold text-xl">ER</span>
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-4">
                "The convenience of virtual appointments has been amazing. I can see my doctor from home without any travel time."
              </p>
              <h4 className="text-xl font-semibold text-gray-800">Sarah Johnson</h4>
              <p className="text-sm text-gray-500">Patient</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 