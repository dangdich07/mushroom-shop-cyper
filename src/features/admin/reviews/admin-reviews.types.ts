export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export type AdminReviewRatingFilter = "ALL" | 1 | 2 | 3 | 4 | 5;
