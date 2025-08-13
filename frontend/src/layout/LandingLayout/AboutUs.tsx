
import { 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Heart, 
  Shield, 
  Award,
  Globe,
  Star,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Dribbble
} from 'lucide-react';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About HealthConnect
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing healthcare delivery by connecting patients with qualified medical professionals 
              through innovative telemedicine technology. Our mission is to make quality healthcare accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-[#008CBA]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              To democratize healthcare by providing accessible, affordable, and high-quality medical consultations 
              through technology, ensuring that geographical barriers no longer prevent anyone from receiving proper medical care.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Accessible healthcare for all
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Quality medical consultations
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Breaking geographical barriers
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 mb-6">
              To become the leading global telemedicine platform that sets the standard for digital healthcare delivery, 
              making quality medical care available to millions of people worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Global healthcare platform
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Industry standard setting
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Millions of lives improved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              HealthConnect by the Numbers
            </h2>
            <p className="text-lg text-gray-600">
              Our impact in transforming healthcare delivery
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#008CBA] mb-2">50+</div>
              <div className="text-gray-600">Medical Specialties</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#008CBA] mb-2">1000+</div>
              <div className="text-gray-600">Qualified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#008CBA] mb-2">50K+</div>
              <div className="text-gray-600">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#008CBA] mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600">
            The dedicated professionals behind HealthConnect
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* CEO */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. John Davis</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Chief Executive Officer</p>
            <p className="text-gray-600 text-sm mb-4">
              Former healthcare executive with 15+ years experience in digital health transformation.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* CTO */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">SM</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah Mitchell</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Chief Technology Officer</p>
            <p className="text-gray-600 text-sm mb-4">
              Tech leader with expertise in healthcare systems and telemedicine platforms.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* CMO */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">RJ</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. Robert Johnson</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Chief Medical Officer</p>
            <p className="text-gray-600 text-sm mb-4">
              Board-certified physician with 20+ years in clinical practice and healthcare innovation.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Head of Engineering */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">MC</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Michael Chen</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Head of Engineering</p>
            <p className="text-gray-600 text-sm mb-4">
              Full-stack developer with 10+ years building scalable healthcare applications.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Head of Design */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">EW</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Emma Wilson</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Head of Design</p>
            <p className="text-gray-600 text-sm mb-4">
              UX/UI designer focused on creating intuitive healthcare experiences for all users.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Dribbble className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Head of Operations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">LB</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lisa Brown</h3>
            <p className="text-[#008CBA] font-semibold mb-3">Head of Operations</p>
            <p className="text-gray-600 text-sm mb-4">
              Operations expert ensuring smooth delivery of healthcare services and customer support.
            </p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008CBA]">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-[#008CBA]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient First</h3>
            <p className="text-gray-600 text-sm">
              Every decision we make prioritizes patient safety, comfort, and positive outcomes.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Security</h3>
            <p className="text-gray-600 text-sm">
              We maintain the highest standards of data security and medical privacy protection.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
            <p className="text-gray-600 text-sm">
              We strive for excellence in every aspect of our service and technology.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
            <p className="text-gray-600 text-sm">
              We believe in the power of teamwork and partnerships to improve healthcare.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              We'd love to hear from you. Reach out to our team for any questions or support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-[#008CBA]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-500 text-sm">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">info@healthconnect.com</p>
                    <p className="text-gray-500 text-sm">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">
                      123 Healthcare Plaza<br />
                      Medical District<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <button className="w-full bg-[#008CBA] hover:bg-[#007A9A] text-white py-3 rounded-lg font-semibold">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
