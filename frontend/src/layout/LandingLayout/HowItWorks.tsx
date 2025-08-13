import { Button } from '../../components/ui/button';
import { 
  Video, 
  MessageCircle, 
  Calendar, 
  UserCheck, 
  Shield, 
  Clock, 
  Star,
  Users,
  Heart,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

export function HowItWorks() {
  const [showScript, setShowScript] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              How HealthConnect Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with healthcare professionals instantly through our innovative telemedicine platform. 
              Get consultations, book appointments, and receive care from the comfort of your home.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-lg text-gray-600">
            Get started with HealthConnect in just a few minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-8 h-8 text-[#008CBA]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Create Your Account</h3>
            <p className="text-gray-600 mb-6">
              Sign up as a patient or doctor. Complete your profile with essential information and verification.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Quick registration process
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Profile verification
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Secure authentication
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Book Your Consultation</h3>
            <p className="text-gray-600 mb-6">
              Browse doctors by specialty, read reviews, and book appointments that fit your schedule.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Find specialists easily
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Flexible scheduling
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Instant confirmation
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Connect & Consult</h3>
            <p className="text-gray-600 mb-6">
              Join your consultation via video call or chat. Receive professional medical advice and prescriptions.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                HD video quality
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Secure connection
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Digital prescriptions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for seamless healthcare delivery
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Video Consultation */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-[#008CBA]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Consultation</h3>
            <p className="text-gray-600 text-sm">
              High-quality video calls with doctors from anywhere. Screen sharing and file sharing capabilities.
            </p>
          </div>

          {/* Chat Consultation */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Consultation</h3>
            <p className="text-gray-600 text-sm">
              Text-based consultations for quick questions and follow-ups. File and image sharing support.
            </p>
          </div>

          {/* Appointment Booking */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Booking</h3>
            <p className="text-gray-600 text-sm">
              Intelligent scheduling system with availability matching and automated reminders.
            </p>
          </div>

          {/* Medical Records */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-gray-600 text-sm">
              Secure storage and easy access to your medical history, prescriptions, and test results.
            </p>
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
            <p className="text-gray-600 text-sm">
              Transparent feedback system to help you choose the right healthcare provider.
            </p>
          </div>

          {/* 24/7 Support */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">
              Round-the-clock customer support to assist you with any questions or technical issues.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Getting Started Guide
            </h2>
            <p className="text-lg text-gray-600">
              Follow these steps to set up your consultation environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Patient Setup */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-8 h-8 text-[#008CBA] mr-3" />
                For Patients
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-[#008CBA]">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Device Requirements</h4>
                    <p className="text-gray-600 text-sm">Computer, tablet, or smartphone with camera and microphone</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-[#008CBA]">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Internet Connection</h4>
                    <p className="text-gray-600 text-sm">Stable broadband connection (minimum 1 Mbps)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-[#008CBA]">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Browser Setup</h4>
                    <p className="text-gray-600 text-sm">Chrome, Firefox, Safari, or Edge (latest versions)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-[#008CBA]">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Test Your Setup</h4>
                    <p className="text-gray-600 text-sm">Use our pre-consultation test to verify audio/video</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Setup */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="w-8 h-8 text-green-600 mr-3" />
                For Doctors
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional Setup</h4>
                    <p className="text-gray-600 text-sm">High-quality webcam and professional lighting</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quiet Environment</h4>
                    <p className="text-gray-600 text-sm">Private, quiet space for confidential consultations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Documentation Tools</h4>
                    <p className="text-gray-600 text-sm">Digital prescription and medical record systems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Schedule Management</h4>
                    <p className="text-gray-600 text-sm">Set your availability and manage appointments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#008CBA] to-[#007A9A] rounded-2xl text-center p-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare professionals who trust HealthConnect for their telemedicine needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <Button 
               className="bg-white text-[#008CBA] hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold w-full sm:w-auto min-w-[140px]"
               onClick={() => window.location.href = '/auth/signup'}
             >
               Sign Up Now
             </Button>
                         <Button 
               className="bg-white text-[#008CBA] hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold w-full sm:w-auto min-w-[140px]"
               onClick={() => window.location.href = '/about'}
             >
               About
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
