import { useState } from 'react';
import { useReviewModalContext } from '../../contexts/ReviewModalContext';
import { useAppDispatch } from '../../Redux/hooks';
import { updateAppointmentStatus } from '../../Redux/appointmentSlice/appointmentSlice';

interface TestReviewSystemProps {
  appointmentId: number;
  doctorId: number;
  doctorName: string;
}

const TestReviewSystem: React.FC<TestReviewSystemProps> = ({
  appointmentId,
  doctorId,
  doctorName
}) => {
  const { openReviewModal } = useReviewModalContext();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string>('CONFIRMED');

  const handleTriggerReview = () => {
    
    openReviewModal(doctorId, doctorName, appointmentId);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await dispatch(updateAppointmentStatus({ id: appointmentId, status: newStatus })).unwrap();
      setStatus(newStatus);
      
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        🧪 Testing Panel - Time Restrictions Disabled
      </h3>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Appointment Info</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Appointment ID:</strong> {appointmentId}</p>
            <p><strong>Doctor:</strong> {doctorName}</p>
            <p><strong>Doctor ID:</strong> {doctorId}</p>
            <p><strong>Current Status:</strong> {status}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Test Actions</h4>
          <div className="space-y-3">
            <button
              onClick={handleTriggerReview}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🎯 Trigger Review Modal
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus('CONFIRMED')}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
              >
                Set CONFIRMED
              </button>
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Set COMPLETED
              </button>
              <button
                onClick={() => handleUpdateStatus('CANCELLED')}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Set CANCELLED
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Testing Notes</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ <strong>Time Restrictions Disabled:</strong> All conversations are now ACTIVE</p>
            <p>✅ <strong>Video Calls:</strong> Can be started at any time for VIDEO appointments</p>
            <p>✅ <strong>Messaging:</strong> Available for all appointment types</p>
            <p>✅ <strong>Review System:</strong> Can be triggered manually for testing</p>
            <p>⚠️ <strong>Remember:</strong> This is for testing only. Re-enable restrictions for production.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReviewSystem;
