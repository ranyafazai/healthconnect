 
import { Link } from 'react-router-dom';
import { Navbar } from '../components/NavBar/NavBar';
import { CalendarCheck, Video, MessageSquare, Lock, Clock, UserPlus } from 'lucide-react';

export default function HowToBookPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={false} />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600/90 to-cyan-500/90 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3">
            <CalendarCheck />
            <h1 className="text-3xl font-bold">How to Book an Appointment</h1>
          </div>
          <p className="text-white/90 mt-2">Follow these simple steps to schedule your consultation on HealthyConnect.</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold"><MessageSquare size={18} /> Text or Video</div>
            <p className="text-gray-700">Choose between a fast text consultation or a face‑to‑face video call based on your needs.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold"><Clock size={18} /> Pick a Time</div>
            <p className="text-gray-700">Select an available time slot that works best for your schedule.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold"><Video size={18} /> Join Easily</div>
            <p className="text-gray-700">Join from any device. For video, test your camera and mic before starting.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold"><Lock size={18} /> Secure</div>
            <p className="text-gray-700">Your data is protected with secure sessions and encrypted communication.</p>
          </div>
        </div>

        <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1"><UserPlus size={18} /> Account Required</div>
          <p className="text-blue-700">To book an appointment, you must be signed in.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
            <Link to="/auth/signin" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">Sign In</Link>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tips</h2>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>Have a stable internet connection for video consultations.</li>
            <li>Prepare a brief summary of your symptoms and medical history.</li>
            <li>Join a few minutes early to test audio/video if applicable.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}


