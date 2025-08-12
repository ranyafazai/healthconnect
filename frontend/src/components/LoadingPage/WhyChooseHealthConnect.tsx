// No React import needed
import { Calendar, Video, ShieldCheck, Clock, Tag, FileText } from "lucide-react";

export function WhyChooseHealthConnect() {
  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments in seconds with our intuitive booking system. Choose your preferred time and doctor with just a few clicks.",
      color: "bg-teal-500"
    },
    {
      icon: Video,
      title: "Secure Video Calls",
      description: "HIPAA-compliant video consultations with crystal-clear quality. Your privacy and security are our top priorities.",
      color: "bg-green-500"
    },
    {
      icon: ShieldCheck,
      title: "Licensed Professionals",
      description: "Connect with board-certified doctors and specialists. All our healthcare providers are thoroughly vetted and licensed.",
      color: "bg-teal-500"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access healthcare when you need it most. Our platform is available around the clock for urgent consultations.",
      color: "bg-green-500"
    },
    {
      icon: Tag,
      title: "Affordable Care",
      description: "Quality healthcare at transparent, affordable prices. Most insurance plans accepted with no hidden fees.",
      color: "bg-teal-500"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Receive prescriptions digitally and have them sent directly to your preferred pharmacy for convenient pickup.",
      color: "bg-green-500"
    }
  ];

  return (
    <section className="w-full py-16" style={{ backgroundColor: '#E8F4FD' }}>
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose HealthConnect?</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Experience the future of healthcare with our comprehensive virtual care platform designed for your convenience and peace of mind.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 