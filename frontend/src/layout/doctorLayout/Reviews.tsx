import React from 'react';

interface Review {
  id: string;
  patientName: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  rating: number;
}

interface RatingDistribution {
  [key: number]: number;
}

interface PerformanceInsights {
  ratingDistribution: RatingDistribution;
  topFeedback: {
    [key: string]: string[];
  };
  strengths: string[];
}

const Reviews: React.FC = () => {
  
  const doctorProfile = {
    name: "Dr. Sarah Johnson",
    performanceInsights: {
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 1,
        4: 2,
        5: 3
      }  as RatingDistribution,
      topFeedback: {
        "Professional": ["Giving", "Thorough", "Clear Explanations"],
        "Knowledgeable": ["On Time", "Good Listener", "Patient"]
      },
      strengths: [
        "Patients consistently praise your professionalism, punctuality, and clear communication style."
      ]
    },
    reviews: [
      {
        id: "1",
        patientName: "Sarah M.",
        date: "Jan 15, 2024",
        title: "Excellent care and communication",
        content: "Dr. Johnson was incredibly thorough and took time to explain everything. The appointment was on time and the staff was very professional.",
        tags: ["Professional", "On Time", "Thorough", "Clear Explanations"],
        rating: 5
      }
    ],
    helpfulReviews: 12
  };



const renderRatingDistribution = () => {
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = doctorProfile.performanceInsights.ratingDistribution[rating];
    
    return (
      <div key={rating} className="flex items-center justify-between mb-1">
        <div className="w-16">{rating} ★</div>
        <div className="flex-1 ml-4">
          <div 
            className="bg-gray-200 h-4 rounded-full"
            style={{
              width: `${(count / 
                      Object.values(doctorProfile.performanceInsights.ratingDistribution).reduce((a, b) => a + b, 0)) * 100}%`
            }}
          ></div>
        </div>
        <div className="w-8 text-right">
          {count}  
        </div>
      </div>
    );
  });
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{doctorProfile.name}</h1>
      <h2 className="text-lg text-gray-600 mb-6">Patient Reviews & Ratings</h2>

      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Performance Insights</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="md:w-1/3">
            <h3 className="font-medium mb-3">Rating Distribution</h3>
            {renderRatingDistribution()}
          </div>

          
          <div className="hidden md:block border-l border-gray-200"></div>

          
          <div className="md:w-2/3">
            <h3 className="font-medium mb-3">Top Patient Feedback</h3>
            {Object.entries(doctorProfile.performanceInsights.topFeedback).map(([category, tags]) => (
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

            <div className="mt-6">
              <h3 className="font-medium mb-2">Strengths identified</h3>
              <p className="text-gray-700">
                {doctorProfile.performanceInsights.strengths[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Patient Reviews</h2>
          <div className="flex gap-4 text-sm">
            <button className="text-cyan-600">All Ratings</button>
            <button className="text-cyan-600">All Reviews</button>
            <button className="text-cyan-600">Newest First</button>
          </div>
        </div>

        {doctorProfile.reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 mb-6 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{review.patientName}</h3>
                <p className="text-gray-500 text-sm">{review.date}</p>
              </div>
              <div className="flex">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-2 mb-2">{review.title}</h4>
            <p className="text-gray-700 mb-3">{review.content}</p>

            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag) => (
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

        <div className="text-sm text-gray-500 mt-6">
          {doctorProfile.helpfulReviews} found helpful
        </div>
      </div>
    </div>
  );
};

export default Reviews;