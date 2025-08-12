<<<<<<< HEAD
export interface ReviewAnalysis {
  topFeedback: {
    [key: string]: string[];
  };
  commonKeywords: string[];
  sentiment: string;
}

export interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  analysis: ReviewAnalysis;
}
=======



>>>>>>> 0731deabc8a1bad4869088665d0efdfbe97c440d
