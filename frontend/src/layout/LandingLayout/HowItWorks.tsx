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

      {/* Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See HealthConnect in Action
            </h2>
            <p className="text-lg text-gray-600">
              Watch our comprehensive demo to understand how easy it is to get started
            </p>
          </div>
          
          {/* Video Player */}
          <div className="bg-gray-900 rounded-xl h-96 mb-8 overflow-hidden">
            {/* Video Player with Smart Fallback */}
            <div className="w-full h-full relative">
              {/* Video Element */}
                             <video
                 id="tutorial-video"
                 className="w-full h-full object-cover"
                 controls
                 poster="/video-thumbnail.jpg"
                 preload="metadata"
                 style={{ display: 'none' }}
               >
                <source src="/healthconnect-tutorial.mp4" type="video/mp4" />
                <source src="/healthconnect-tutorial.webm" type="video/webm" />
                <source src="/healthconnect-tutorial.ogg" type="video/ogg" />
              </video>
              
                             {/* Placeholder - Shows when video is not available */}
               <div 
                 id="video-placeholder" 
                 className="w-full h-full flex items-center justify-center absolute inset-0"
                 style={{ display: 'flex' }}
               >
                 <div className="text-center text-white">
                   <Video className="w-20 h-20 mx-auto mb-6 text-blue-400" />
                   <h3 className="text-2xl font-bold mb-4">Video Tutorial Coming Soon!</h3>
                   <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto">
                     We're creating a comprehensive tutorial video that will show you exactly how to use HealthConnect
                   </p>
                   
                   {/* Quick action buttons */}
                   <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                     <Button 
                       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                       onClick={() => document.getElementById('tutorial-script')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                       View Tutorial Script
                     </Button>
                     <Button 
                       variant="outline" 
                       className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-6 py-2 rounded-full"
                       onClick={() => document.getElementById('video-instructions')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                       How to Add Video
                     </Button>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          

          
          {/* Video Description */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn in This Tutorial</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Complete sign-up and sign-in process</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Finding and booking doctors</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Video consultation setup and process</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Chat and messaging features</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Leaving reviews and ratings</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Managing appointments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Viewing consultation history</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#008CBA] rounded-full mr-3"></div>
                  <span>Profile and settings management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Tutorial Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
              <span className="text-sm font-bold text-blue-600">ℹ️</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">How to Add Your Tutorial Video</h4>
              <p className="text-blue-700 text-sm mb-3">
                To add your actual tutorial video, follow these steps:
              </p>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Create a video tutorial covering the topics listed above</li>
                <li>Export it in MP4, WebM, or OGG format</li>
                <li>Place the video file in the <code className="bg-blue-100 px-1 rounded">public</code> folder</li>
                <li>Update the video source paths in the code above</li>
                <li>Add a thumbnail image as <code className="bg-blue-100 px-1 rounded">video-thumbnail.jpg</code></li>
              </ol>
              
              {/* Tutorial Script Toggle */}
              <button
                onClick={() => setShowScript(!showScript)}
                className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                {showScript ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Tutorial Script
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Tutorial Script
                  </>
                )}
              </button>
              
                             {/* Tutorial Script */}
               {showScript && (
                 <div id="tutorial-script" className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-3">Suggested Video Tutorial Script</h5>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div>
                      <strong>1. Introduction (0:00-0:30)</strong>
                      <p>Welcome to HealthConnect! In this tutorial, I'll show you everything you need to know to get started with our telemedicine platform.</p>
                    </div>
                    <div>
                      <strong>2. Account Creation (0:30-2:00)</strong>
                      <p>Start by clicking "Sign Up" and choose whether you're a patient or doctor. Fill in your details and verify your email.</p>
                    </div>
                    <div>
                      <strong>3. Finding Doctors (2:00-3:30)</strong>
                      <p>Browse doctors by specialty, read reviews, and check their availability. Use filters to find the perfect match.</p>
                    </div>
                    <div>
                      <strong>4. Booking Appointments (3:30-5:00)</strong>
                      <p>Select your preferred date and time, choose consultation type (video or chat), and confirm your booking.</p>
                    </div>
                    <div>
                      <strong>5. Video Consultation (5:00-7:00)</strong>
                      <p>Join your consultation on time, test your audio/video, and enjoy high-quality medical care from home.</p>
                    </div>
                    <div>
                      <strong>6. Messaging & Reviews (7:00-8:30)</strong>
                      <p>Send messages to doctors, leave reviews after consultations, and manage your medical records.</p>
                    </div>
                    <div>
                      <strong>7. Managing Appointments (8:30-9:30)</strong>
                      <p>View your consultation history, download reports, and manage upcoming appointments.</p>
                    </div>
                    <div>
                      <strong>8. Conclusion (9:30-10:00)</strong>
                      <p>That's it! You're now ready to use HealthConnect. Start your healthcare journey today!</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Video Requirements */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-2">Video Requirements & Best Practices</h5>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-yellow-700">
                  <div>
                    <strong>Technical Requirements:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Resolution: 1920x1080 (Full HD) or higher</li>
                      <li>• Format: MP4 (H.264), WebM, or OGG</li>
                      <li>• Duration: 8-12 minutes recommended</li>
                      <li>• File size: Keep under 100MB for web</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Content Tips:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Use clear, step-by-step narration</li>
                      <li>• Show real examples from your platform</li>
                      <li>• Include captions for accessibility</li>
                      <li>• Test on different devices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
               className="bg-white text-[#008CBA] hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold"

               onClick={() => window.location.href = '/auth/signup'}
             >
               Sign Up Now
             </Button>
             <Button 
               variant="outline" 
               className="border-white text-white hover:bg-white hover:text-[#008CBA] px-8 py-3 rounded-full text-lg font-semibold"
               onClick={() => window.location.href = '/about'}
             >
               Learn More
             </Button>
           </div>

        </div>
      </div>
    </div>
  );
}
