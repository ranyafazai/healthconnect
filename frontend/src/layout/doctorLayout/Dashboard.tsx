import {
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  Bell
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Today's Appointments", value: 5, icon: <Calendar className="text-cyan-500" size={20} /> },
    { title: "Unread Messages", value: 3, icon: <MessageSquare className="text-red-400" size={20} /> },
    { title: "Average Rating", value: 4.8, icon: <Star className="text-yellow-500" size={20} /> },
    { title: "Total Reviews", value: 127, icon: <CheckCircle className="text-green-500" size={20} /> },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
          })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </div>
          <div className="bg-cyan-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
            DJ
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              {stat.icon}
              {stat.title}
            </div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Today's Appointments</h2>
            <button className="text-cyan-600 text-sm">View All</button>
          </div>
          <div className="bg-gray-50 h-20 rounded-md"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Recent Messages</h2>
            <button className="text-cyan-600 text-sm">View All</button>
          </div>
          <div className="bg-gray-50 h-20 rounded-md"></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Recent Reviews</h2>
          <button className="text-cyan-600 text-sm">View All</button>
        </div>
        <div className="bg-gray-50 h-20 rounded-md"></div>
      </div>
    </div>
  );
}
