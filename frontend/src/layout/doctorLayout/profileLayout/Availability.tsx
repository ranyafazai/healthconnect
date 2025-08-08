import { useState } from "react";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Availability() {
  const [schedule, setSchedule] = useState(
    weekdays.map((day) => ({
      day,
      available: ["Saturday", "Sunday"].includes(day) ? false : true,
      from: "",
      to: "",
    }))
  );

  const [appointmentDuration, setAppointmentDuration] = useState("30 minutes");
  const [bufferTime, setBufferTime] = useState("10 minutes");
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [allowBooking, setAllowBooking] = useState(true);

  const handleToggle = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleTimeChange = (
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      schedule,
      appointmentDuration,
      bufferTime,
      autoConfirm,
      allowBooking,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto"
    >
      <h2 className="text-lg font-semibold mb-4">Availability Settings</h2>

      {/* Weekly Schedule */}
      <div className="border border-blue-100 bg-blue-50 p-4 rounded-md mb-6">
        <h3 className="font-semibold text-sm mb-4">Weekly Schedule</h3>
        <div className="flex flex-col gap-3">
          {schedule.map((day, idx) => (
            <div
              key={day.day}
              className={`flex items-center justify-between border rounded-md p-2 ${
                day.available ? "border-cyan-500 bg-white" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.available}
                  onChange={() => handleToggle(idx)}
                  className="accent-cyan-600"
                />
                <label className="text-sm font-medium">{day.day}</label>
              </div>

              {day.available ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">From:</span>
                  <input
                    type="time"
                    value={day.from}
                    onChange={(e) =>
                      handleTimeChange(idx, "from", e.target.value)
                    }
                    className="border border-gray-300 rounded-md p-1"
                  />
                  <span className="text-sm text-gray-500">To:</span>
                  <input
                    type="time"
                    value={day.to}
                    onChange={(e) =>
                      handleTimeChange(idx, "to", e.target.value)
                    }
                    className="border border-gray-300 rounded-md p-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Settings */}
      <div className="border border-gray-200 bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-semibold text-sm mb-4">Appointment Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Appointment Duration
            </label>
            <select
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Buffer Time
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>0 minutes</option>
              <option>5 minutes</option>
              <option>10 minutes</option>
              <option>15 minutes</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoConfirm}
              onChange={(e) => setAutoConfirm(e.target.checked)}
              className="accent-cyan-600"
            />
            Automatically confirm appointments
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allowBooking}
              onChange={(e) => setAllowBooking(e.target.checked)}
              className="accent-cyan-600"
            />
            Allow online booking
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

