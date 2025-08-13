// No React default import required
import { useState } from 'react';
import { useAppDispatch } from '../../Redux/hooks';
import { createReview } from '../../Redux/reviewSlice/reviewSlice';
import { Star, FileText } from 'lucide-react';

interface ReviewFormProps {
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  doctorId,
  doctorName,
  appointmentId,
  onSuccess,
  onCancel,
  isModal = false
}) => {
  const dispatch = useAppDispatch();
  
  // Overall experience rating
  const [overallRating, setOverallRating] = useState(0);
  const [overallHovered, setOverallHovered] = useState(0);
  
  // Specific ratings
  const [communicationRating, setCommunicationRating] = useState(0);
  const [communicationHovered, setCommunicationHovered] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [punctualityHovered, setPunctualityHovered] = useState(0);
  
  // Descriptive tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Comments
  const [comment, setComment] = useState('');
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descriptiveTags = [
    'Helpful', 'On Time', 'Professional', 'Knowledgeable', 'Caring',
    'Patient', 'Thorough', 'Clear Explanations', 'Good Listener', 'Respectful'
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      alert('Please select an overall rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a comprehensive comment that includes specific ratings and tags
      let fullComment = comment;
      
      if (communicationRating > 0 || punctualityRating > 0) {
        const specificRatings = [];
        if (communicationRating > 0) {
          specificRatings.push(`Communication: ${communicationRating}/5`);
        }
        if (punctualityRating > 0) {
          specificRatings.push(`Punctuality: ${punctualityRating}/5`);
        }
        if (specificRatings.length > 0) {
          fullComment = `[${specificRatings.join(', ')}] ${comment}`.trim();
        }
      }
      
      if (selectedTags.length > 0) {
        const tagsText = `Tags: ${selectedTags.join(', ')}`;
        fullComment = fullComment ? `${fullComment}\n\n${tagsText}` : tagsText;
      }

      await dispatch(createReview({
        doctorId,
        rating: overallRating,
        comment: fullComment,
        appointmentId
      })).unwrap();
      
      // Reset form
      setOverallRating(0);
      setCommunicationRating(0);
      setPunctualityRating(0);
      setSelectedTags([]);
      setComment('');
      onSuccess?.();
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    rating: number,
    setRating: (rating: number) => void,
    hovered: number,
    setHovered: (rating: number) => void,
    size: number = 24
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
          >
            <Star
              size={size}
              className={`${
                star <= (hovered || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${isModal ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
          <p className="text-gray-600">Help us improve by sharing your feedback about {doctorName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Experience */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Experience</h3>
          <div className="mb-2">
            {renderStarRating(overallRating, setOverallRating, overallHovered, setOverallHovered, 32)}
          </div>
          <p className="text-sm text-gray-600">Rate your overall satisfaction with this appointment</p>
        </div>

        {/* Specific Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Communication */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Communication</h4>
            <div className="mb-2">
              {renderStarRating(communicationRating, setCommunicationRating, communicationHovered, setCommunicationHovered)}
            </div>
            <p className="text-sm text-gray-600">How well did the doctor communicate?</p>
          </div>

          {/* Punctuality */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Punctuality</h4>
            <div className="mb-2">
              {renderStarRating(punctualityRating, setPunctualityRating, punctualityHovered, setPunctualityHovered)}
            </div>
            <p className="text-sm text-gray-600">Was the appointment on time?</p>
          </div>
        </div>

        {/* Descriptive Tags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What describes your experience? <span className="text-sm font-normal text-gray-600">(select all that apply)</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {descriptiveTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Share Your Thoughts <span className="text-sm font-normal text-gray-600">(Optional)</span>
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell us about your experience..."
            maxLength={500}
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-500">{comment.length}/500</span>
          </div>
        </div>

        {/* Privacy Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your feedback is anonymous and secure</p>
              <p className="text-sm text-gray-600 mt-1">
                We use your feedback to improve our services and help other patients make informed decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
