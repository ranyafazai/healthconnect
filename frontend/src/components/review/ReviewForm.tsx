// No React default import required
import { useState } from 'react';
import { useAppDispatch } from '../../Redux/hooks';
import  {createReview}  from '../../Redux/reviewSlice/reviewSlice';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  doctorId,
  doctorName,
  appointmentId,
  onSuccess,
  onCancel
}) => {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createReview({
        doctorId,
        rating,
        comment,
        appointmentId
      })).unwrap();
      
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoverRating: number) => {
    setHoveredRating(hoverRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Review Dr. {doctorName}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleRatingHover(star)}
                onMouseLeave={handleRatingLeave}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this doctor..."
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
