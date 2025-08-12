import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { Star } from 'lucide-react';
import type { RootState } from '../../Redux/store';
import { fetchDoctorReviews } from '../../Redux/reviewSlice/reviewSlice';

const Reviews: React.FC = () => {
  const dispatch = useAppDispatch();
   const { user } = useAppSelector((state: RootState) => state.auth); 
    const { profile } = useAppSelector((state: RootState) => state.user);
  const { reviews, stats, loading } = useAppSelector((state: RootState) => state.review);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchDoctorReviews(profile.id));
    }
  }, [dispatch, profile?.id]);

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return [5, 4, 3, 2, 1].map((rating) => {
      const count = stats.ratingDistribution[rating] || 0;
      const percentage = stats.totalReviews > 0 
        ? (count / stats.totalReviews) * 100 
        : 0;
      
      return (
        <div key={rating} className="flex items-center justify-between mb-1">
          <div className="w-16 flex items-center gap-1">
            <span>{rating}</span>
            <Star className="text-yellow-400" size={12} />
          </div>
          <div className="flex-1 ml-4">
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-yellow-400 h-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          <div className="w-8 text-right">
            {count}
          </div>
        </div>
      );
    });
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Dr. {user?.email?.split('@')[0] || 'Doctor'}
      </h1>
      <h2 className="text-lg text-gray-600 mb-6">Patient Reviews & Ratings</h2>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-500">
              {stats?.averageRating.toFixed(1) || '0.0'}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`${
                    i < Math.floor(stats?.averageRating || 0) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                  size={20} 
                />
              ))}
            </div>
            <span className="text-gray-600">
              ({stats?.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <h3 className="font-medium mb-3">Rating Distribution</h3>
            {renderRatingDistribution()}
          </div>

          <div className="hidden md:block border-l border-gray-200" />

          <div className="md:w-2/3">
            <h3 className="font-medium mb-3">Top Patient Feedback</h3>
            {stats?.analysis && Object.entries(stats.analysis.topFeedback).map(([category, tags]) => (
              <div key={category} className="mb-4">
                <strong className="text-gray-800">{category}</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {stats?.analysis && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Sentiment Analysis</h3>
                <p className="text-gray-700">
                  {stats.analysis.sentiment}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Patient Reviews</h2>
          <div className="flex gap-4 text-sm">
            <button className="text-gray-600 hover:text-gray-900">
              All Ratings
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              Latest First
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No reviews yet</div>
            <p className="text-sm text-gray-400">
              Continue providing excellent care to receive patient feedback
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 mb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">Patient #{review.patientId}</h3>
                  <p className="text-gray-500 text-sm">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`${
                        i < review.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                      size={16} 
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              {review.appointmentId && (
                <div className="text-sm text-gray-500">
                  Appointment #{review.appointmentId}
                </div>
              )}
            </div>
          ))
        )}

        <div className="text-sm text-gray-500 mt-6">
          {stats?.totalReviews || 0} total reviews
        </div>
      </div>
    </div>
  );
};

export default Reviews;