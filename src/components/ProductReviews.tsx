import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface ProductReviewsProps {
  productId: number;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  review_text: z.string().max(1000, "Review must be less than 1000 characters").optional(),
});

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    setReviews(data || []);
    if (user) {
      const myReview = data?.find((r) => r.user_id === user.id);
      if (myReview) {
        setUserReview(myReview);
        setRating(myReview.rating);
        setReviewText(myReview.review_text || "");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    try {
      const validated = reviewSchema.parse({ rating, review_text: reviewText });
      setLoading(true);

      if (userReview) {
        const { error } = await supabase
          .from("product_reviews")
          .update({
            rating: validated.rating,
            review_text: validated.review_text || null,
          })
          .eq("id", userReview.id);

        if (error) throw error;
        toast.success("Review updated successfully");
      } else {
        const { error } = await supabase
          .from("product_reviews")
          .insert({
            product_id: productId,
            rating: validated.rating,
            review_text: validated.review_text || null,
            user_id: user.id,
          });

        if (error) throw error;
        toast.success("Review submitted successfully");
      }

      setRating(0);
      setReviewText("");
      fetchReviews();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const renderStars = (count: number, interactive = false, onHover?: (i: number) => void, onClick?: (i: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${interactive ? "cursor-pointer" : ""} ${
              i <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
            onMouseEnter={() => interactive && onHover?.(i)}
            onMouseLeave={() => interactive && onHover?.(0)}
            onClick={() => interactive && onClick?.(i)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {renderStars(Math.round(parseFloat(averageRating)))}
            <span className="text-2xl font-bold">{averageRating}</span>
          </div>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>

        {user && (
          <div className="bg-muted/50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">
              {userReview ? "Update Your Review" : "Write a Review"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                {renderStars(
                  hoverRating || rating,
                  true,
                  setHoverRating,
                  setRating
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reviewText.length}/1000 characters
                </p>
              </div>
              <Button onClick={handleSubmitReview} disabled={loading || rating === 0}>
                {userReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.profiles.full_name || review.profiles.email.split("@")[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.review_text && (
                <p className="text-muted-foreground mt-2">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
