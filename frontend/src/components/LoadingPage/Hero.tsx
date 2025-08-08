import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <div className="w-full bg-blue-50">
      <section className="w-full flex flex-col md:flex-row items-center justify-between p-8 px-8 bg-blue-50">
        {/* Left Side */}
        <div className="flex-1 min-w-[250px] md:pr-8 ml-10">
          <h1 className="text-5xl font-bold mb-2 text-gray-800">
            Your Health<span style={{ color: '#008CBA' }}>,Connected</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Book virtual appointments with certified doctors from the comfort of your home. Quality healthcare is now just a click away.
          </p>
          <div className="flex gap-4 mb-6">
            <Button className="text-white font-bold shadow-md rounded-full px-8 py-3 hover:opacity-90 transition-all duration-200" style={{ backgroundColor: '#008CBA' }}>
              Book Appointment
            </Button>
            <Button variant="outline" className="bg-white font-bold shadow-md rounded-full px-8 py-3 hover:bg-gray-50 transition-all duration-200" style={{ borderColor: '#008CBA', color: '#008CBA' }}>
              Learn More
            </Button>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Licensed Doctors</span>
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center mt-8 md:mt-0">
          <Card className="text-white p-12 rounded-4xl shadow-lg flex items-center justify-center min-w-[500px] min-h-[400px] text-2xl font-bold" style={{ backgroundColor: '#008CBA' }}>
            Doctor Video Call
          </Card>
        </div>
      </section>
    </div>
  );
}