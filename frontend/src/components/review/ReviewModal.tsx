import { useEffect } from 'react';
import ReviewForm from './ReviewForm';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  appointmentId,
  onReviewSubmitted
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReviewSuccess = () => {
    onReviewSubmitted?.();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Review Form */}
          <ReviewForm
            doctorId={doctorId}
            doctorName={doctorName}
            appointmentId={appointmentId}
            onSuccess={handleReviewSuccess}
            onCancel={handleClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
