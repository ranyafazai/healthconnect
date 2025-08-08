import React from "react";
import DoctorCard from "./DoctorCard";
import FullLine from "./FullLine";
import { BookingSummary } from "./BookingSummary";

interface ConfirmationProps {
  onPrev: () => void;
  bookingData: any;
}

export function Confirmation({ onPrev, bookingData }: ConfirmationProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorCard />
            <div className="ml-5 mr-5  mx-auto px-6 pb-8">
        <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Your Appointment</h1>
          </div>

          <div className="mb-8">
            <FullLine currentStep={4} />
          </div>

          {/* Content Area */}
          <div className="flex gap-8">
            <div className="flex-1 border-2 border-green-500 rounded-lg p-12 flex flex-col items-center justify-center min-h-64 bg-white">
              {/* Large Green Circle Placeholder */}
              <div className="w-32 h-32 bg-green-500 rounded-full mb-6 flex items-center justify-center">
                <span className="text-white text-4xl">✓</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your appointment has been successfully booked. You will receive a confirmation email shortly.
              </p>
              
              {/* Booking Details */}
              <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md">
                <h3 className="font-bold text-gray-800 mb-4">Booking Details:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Date & Time:</strong> {bookingData.date} at {bookingData.time}</div>
                  <div><strong>Consultation Type:</strong> {bookingData.consultationType === 'video' ? 'Video Call' : 'Text Chat'}</div>
                  {bookingData.patientInfo?.fullName && (
                    <div><strong>Patient:</strong> {bookingData.patientInfo.fullName}</div>
                  )}
                </div>
              </div>
            </div>
            
          
          </div>


        </div>
      </div>
    </div>
  );
}
