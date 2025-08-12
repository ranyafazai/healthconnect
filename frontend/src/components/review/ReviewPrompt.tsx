// No React default import required
import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';

interface ReviewPromptProps {
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  onReviewSubmitted?: () => void;
}

const ReviewPrompt: React.FC<ReviewPromptProps> = ({
  doctorId,
  doctorName,
  appointmentId,
  onReviewSubmitted
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setHasReviewed(true);
    onReviewSubmitted?.();
  };

  const handleCancel = () => {
    setShowReviewForm(false);
  };

  if (hasReviewed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
          <Star size={20} className="fill-current" />
          <span className="font-medium">Thank you for your review!</span>
        </div>
        <p className="text-sm text-green-700">
          Your feedback helps other patients make informed decisions.
        </p>
      </div>
    );
  }

  if (showReviewForm) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <ReviewForm
          doctorId={doctorId}
          doctorName={doctorName}
          appointmentId={appointmentId}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <MessageSquare size={24} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            How was your consultation with Dr. {doctorName}?
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Share your experience to help other patients and improve healthcare quality.
          </p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Write Review
        </button>
      </div>
    </div>
  );
};

export default ReviewPrompt;
