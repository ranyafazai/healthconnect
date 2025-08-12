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
