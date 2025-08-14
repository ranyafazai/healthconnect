import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { fetchUserProfile } from "../../../Redux/userSlice/userSlice";
import { updateDoctorProfile } from "../../../Api/doctor.api";

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
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  type DayKey = 'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'|'sunday';
  const dayNameToKey: Record<string, DayKey> = {
    Monday: 'monday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
    Thursday: 'thursday',
    Friday: 'friday',
    Saturday: 'saturday',
    Sunday: 'sunday',
  };

  // keyToDayName mapping not used currently

  const [schedule, setSchedule] = useState(
    weekdays.map((day) => ({
      day,
      available: false,
      from: "",
      to: "",
    }))
  );

  const [appointmentDuration, setAppointmentDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("10");
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [allowBooking, setAllowBooking] = useState(true);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    const availability = profile?.doctorProfile?.availability as any;
    if (availability && typeof availability === 'object') {
      const next = weekdays.map((day) => {
        const key = dayNameToKey[day];
        const timeSlots = availability[key] || [];
        
        // Handle the seed data format: ["08:00-12:00", "13:00-17:00"]
        let from = "";
        let to = "";
        
        if (Array.isArray(timeSlots) && timeSlots.length > 0) {
          const firstSlot = timeSlots[0];
          if (typeof firstSlot === 'string' && firstSlot.includes('-')) {
            const [start, end] = firstSlot.split('-');
            from = start;
            to = end;
          }
        }
        
        return {
          day,
          available: timeSlots.length > 0,
          from,
          to,
        };
      });
      setSchedule(next);
    }
  }, [profile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.doctorProfile?.id) {
      setUpdateMessage({ type: 'error', text: 'Doctor profile ID not found' });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);

    // Map UI schedule back to backend JSON structure (matching seed data format)
    const availability: Record<DayKey, string[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    for (const row of schedule) {
      const key = dayNameToKey[row.day];
      if (row.available && row.from && row.to) {
        availability[key] = [`${row.from}-${row.to}`];
      }
    }

    try {
      // Use the correct doctor API endpoint
      await updateDoctorProfile(profile.doctorProfile.id, {
        availability: availability as any
      });
      
      // Refresh the user profile to get updated data
      dispatch(fetchUserProfile());
      setUpdateMessage({ type: 'success', text: 'Availability updated successfully!' });
    } catch (error) {
      setUpdateMessage({ type: 'error', text: 'Failed to update availability. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Availability Settings</h2>
      
      {/* Success/Error Messages */}
      {updateMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          updateMessage.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {updateMessage.text}
        </div>
      )}

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
                  <input type="time" value={day.from} onChange={(e) => handleTimeChange(idx, "from", e.target.value)} className="border border-gray-300 rounded-md p-1" />
                  <span className="text-sm text-gray-500">To:</span>
                  <input type="time" value={day.to} onChange={(e) => handleTimeChange(idx, "to", e.target.value)} className="border border-gray-300 rounded-md p-1" />
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
             <select value={appointmentDuration} onChange={(e) => setAppointmentDuration(e.target.value)} className="w-full border border-gray-300 rounded-md p-2">
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
             <select value={bufferTime} onChange={(e) => setBufferTime(e.target.value)} className="w-full border border-gray-300 rounded-md p-2">
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
          disabled={isUpdating}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

