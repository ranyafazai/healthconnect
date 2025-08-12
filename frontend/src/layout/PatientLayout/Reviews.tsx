import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../Redux/hooks';
import { fetchPatientReviews, deleteReview } from '../../Redux/reviewSlice/reviewSlice';
import { Star, Edit, Trash2, Plus } from 'lucide-react';
import ReviewForm from '../../components/review/ReviewForm';
import type { Review } from '../../types/data/review';

const Reviews: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useAppSelector((state) => state.review);
  const { user } = useAppSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      dispatch(fetchPatientReviews(user.patientProfile.id));
    }
  }, [dispatch, user?.patientProfile?.id]);

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await dispatch(deleteReview(reviewId)).unwrap();
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setSelectedDoctor(null);
    // Refresh reviews
    if (user?.patientProfile?.id) {
      dispatch(fetchPatientReviews(user.patientProfile.id));
    }
  };

  const handleCancel = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setSelectedDoctor(null);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  if (showReviewForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <ReviewForm
          doctorId={editingReview?.doctorId || selectedDoctor?.id || 0}
          doctorName={editingReview?.doctor?.firstName + ' ' + editingReview?.doctor?.lastName || selectedDoctor?.name || ''}
          appointmentId={editingReview?.appointmentId}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <button
          onClick={() => setShowReviewForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Write a Review
        </button>
      </div>

      {/* Reviews Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {reviews.filter(review => review.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">5-Star Reviews</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Reviews</h2>
        </div>
        
        {reviews.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 mb-2">No reviews yet</div>
            <p className="text-sm text-gray-400">
              Start sharing your experiences with doctors to help others make informed decisions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Dr. {review.doctor?.firstName} {review.doctor?.lastName}
                      </h3>
                      <div className="flex items-center space-x-1">
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
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    
                    {review.appointmentId && (
                      <p className="text-sm text-gray-500">
                        Appointment #{review.appointmentId}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit review"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
