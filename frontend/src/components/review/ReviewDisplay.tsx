import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../../types/data/review';

interface ReviewDisplayProps {
  reviews: Review[];
  showPatientNames?: boolean;
  maxReviews?: number;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  reviews,
  showPatientNames = false,
  maxReviews
}) => {
  const displayReviews = maxReviews ? reviews.slice(0, maxReviews) : reviews;

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No reviews yet</p>
        <p className="text-sm">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayReviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {showPatientNames && review.patient ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {review.patient.firstName?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {review.patient.firstName} {review.patient.lastName}
                  </span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {review.patient?.firstName?.charAt(0) || 'P'}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {review.rating} star{review.rating > 1 ? 's' : ''}
            </span>
          </div>
          
          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed">
              "{review.comment}"
            </p>
          )}
          
          {review.appointmentId && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Consultation #{review.appointmentId}
              </span>
            </div>
          )}
        </div>
      ))}
      
      {maxReviews && reviews.length > maxReviews && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {maxReviews} of {reviews.length} reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;
