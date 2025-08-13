 
import { Navbar } from '../components/NavBar/NavBar';
import {
  Shield,
  Users,
  Lock,
  Star,
  HeartPulse,
  Stethoscope,
  GraduationCap,
  Building2,
  Rocket,
  BookOpen,
  CheckCircle
} from 'lucide-react';

export default function LearnMorePage() {
  const partners = ['MediTrust', 'CarePlus', 'HealthNet', 'WellnessCo', 'ClinicX', 'LifeCare'];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={false} />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600/90 to-cyan-500/90 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm">
              <Shield size={14} className="text-white" />
              <span>Trusted, secure, and people-first</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">About HealthyConnect</h1>
            <p className="text-white/90 max-w-2xl">Everything you need to know about our platform, mission, and how it helps patients and doctors.</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <HeartPulse className="text-blue-600 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vision & Mission</h2>
              <p className="text-gray-700">Our vision is to make quality healthcare accessible to everyone, anywhere. Our mission is to connect patients with certified, compassionate doctors through a secure, easy-to-use digital experience.</p>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Users className="text-blue-600 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">How the Platform Works – Patients</h2>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Search by specialization, city, rating, or availability.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Book text or video consultations at your convenience.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Manage appointments and view history securely.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Stethoscope className="text-blue-600 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">How the Platform Works – Doctors</h2>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Set availability and manage appointments.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Grow your practice with ratings and reviews.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="text-green-500" size={16} /> Communicate securely and share resources.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Lock className="text-blue-600 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Security & Privacy</h2>
              <p className="text-gray-700">We use encrypted connections and strict access controls. Only authorized users can access medical data, and sessions are protected to keep your information private and secure.</p>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <BookOpen className="text-blue-600 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Benefits for Patients</h2>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Convenient online care: book in minutes.</li>
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Transparent reviews and ratings.</li>
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Secure messaging and reminders.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <GraduationCap className="text-blue-600 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Benefits for Doctors</h2>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Streamlined scheduling and communication.</li>
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Visibility to new patients.</li>
                  <li className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> Efficient virtual care tools.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Success Stories & Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (<Star key={i} size={16} className="text-yellow-400" />))}
              </div>
              <p className="text-gray-700">“I booked a video consultation in minutes. The doctor was attentive and helpful – highly recommend!”</p>
              <p className="text-gray-500 text-sm mt-2">— A satisfied patient</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (<Star key={i} size={16} className="text-yellow-400" />))}
              </div>
              <p className="text-gray-700">“HealthyConnect improved my scheduling and reduced no‑shows. Virtual follow‑ups are seamless.”</p>
              <p className="text-gray-500 text-sm mt-2">— A practicing doctor</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <BookOpen className="text-blue-600 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Health Resources & Education</h2>
              <p className="text-gray-700">We provide curated health articles and tips to help patients make informed decisions and adopt healthier habits.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="text-blue-600 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Partnerships & Accreditations</h2>
              <p className="text-gray-700">HealthyConnect collaborates with certified professionals and recognized healthcare organizations to uphold high standards of care.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {partners.map((p) => (
              <div key={p} className="bg-white border border-gray-200 rounded-lg py-4 px-3 shadow-sm flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mr-2">
                  {p.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <span className="text-gray-800 text-sm font-medium">{p}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Rocket className="text-blue-600 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Future Goals</h2>
              <p className="text-gray-700">We are expanding our network, enhancing AI‑assisted triage, and adding multilingual support to better serve global communities.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


