  import { useState, useEffect } from "react";
import { reviewApi } from "../../api/reviewApi.ts";
import { Review } from "../../types/Review.ts";
import "./CommentsSection.css";
//   const mockComments = [
//   {
//     id: 1,
//     name: "Nguyễn Văn A",
//     content: "Sản phẩm rất đẹp, chất lượng tốt!",
//     date: Date.now() - 86400000, // 1 ngày trước
//   },
//   {
//     id: 2,
//     name: "Trần Thị B",
//     content: "Giao hàng nhanh, đóng gói cẩn thận.",
//     date: Date.now() - 3600000, // 1 giờ trước
//   },
//   {
//     id: 3,
//     name: "Lê Văn C",
//     content: "Màu sắc giống hình, nhưng size hơi nhỏ.",
//     date: Date.now() - 7200000, // 2 giờ trước
//   },
// ];

interface CommentsSectionProps {
  productId: string;
}

export default function CommentsSection({ productId }: CommentsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewApi.getReviewsByProduct(productId);
        setReviews(response.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải bình luận');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="comments-section">Đang tải bình luận...</div>;
  }

  if (error) {
    return <div className="comments-section text-error">{error}</div>;
  }
  return (
    <div className="comments-section">
      <h2>Bình luận</h2>
        {/* Form bình luận
        <div className="comment-form">
        <img
            src="https://i.pravatar.cc/50"
            alt="avatar"
            className="comment-avatar"
        />
        <textarea
            placeholder="Viết bình luận..."
            className="comment-input"
        ></textarea>
        <button type="submit" className="btn-submit-comment">
            Gửi
        </button>
        </div> */}


      {/* Danh sách bình luận */}
      <div className="comment-list">
        {reviews.map((review) => (
          <div key={review._id} className="comment-item">
            <div className="comment-header">
              <img 
                src={review.user?.avt || "https://i.pravatar.cc/50"} 
                alt={review.user?.fullName || "Ẩn danh"} 
                className="comment-avatar"
              />
              <div>
                <strong>{review.user?.fullName || "Ẩn danh"}</strong>
                <div className="rating">{"⭐".repeat(review.rating)}</div>
                <span className="comment-date">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
    );
}