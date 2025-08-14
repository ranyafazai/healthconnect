import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../Redux/hooks';
import { fetchPatientReviews, deleteReview } from '../../Redux/reviewSlice/reviewSlice';
import { Star, Trash2, AlertTriangle } from 'lucide-react';

const Reviews: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useAppSelector((state) => state.review);
  const { user } = useAppSelector((state) => state.auth);

  const [confirm, setConfirm] = useState<{ id: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      dispatch(fetchPatientReviews(user.patientProfile.id));
    }
  }, [dispatch, user?.patientProfile?.id]);

  const handleDeleteReview = async (reviewId: string | number) => {
    setConfirm({ id: Number(reviewId) });
  };

  const confirmDelete = async () => {
    if (!confirm) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteReview(confirm.id)).unwrap();
      setConfirm(null);
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
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

      {/* Elegant Confirm Delete Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete review?</h3>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The review will be permanently removed from your history.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
