import { useReviewModalContext } from '../../contexts/ReviewModalContext';

interface ReviewTriggerExampleProps {
  doctorId: number;
  doctorName: string;
  appointmentId: number;
}

const ReviewTriggerExample: React.FC<ReviewTriggerExampleProps> = ({
  doctorId,
  doctorName,
  appointmentId
}) => {
  const { openReviewModal } = useReviewModalContext();

  const handleConsultationEnd = () => {
    // This function would be called when:
    // 1. Video call ends
    // 2. Messaging session ends
    // 3. Appointment status changes to COMPLETED
    // 4. Patient leaves the consultation page
    
    // You can add additional logic here:
    // - Check if patient has already reviewed this appointment
    // - Check if enough time has passed since consultation
    // - Show a confirmation dialog first
    
    
    openReviewModal(doctorId, doctorName, appointmentId);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Review Trigger Example</h3>
      <p className="text-sm text-gray-600 mb-4">
        This demonstrates how to trigger the review modal after a consultation ends.
      </p>
      
      <div className="space-y-2 text-sm">
        <p><strong>Doctor:</strong> {doctorName}</p>
        <p><strong>Appointment ID:</strong> {appointmentId}</p>
      </div>
      
      <button
        onClick={handleConsultationEnd}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Simulate Consultation End
      </button>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Integration Points:</strong>
        </p>
        <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
          <li>Video call end event</li>
          <li>Messaging session timeout</li>
          <li>Appointment status change to COMPLETED</li>
          <li>Patient navigation away from consultation</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewTriggerExample;
