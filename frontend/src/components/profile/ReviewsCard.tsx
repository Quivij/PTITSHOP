import React, { useEffect, useState } from "react";
import { profileApi } from "../../api/profileApi.ts";
import { Review } from "../../types/Review.ts";

interface ReviewsCardProps { }

const ReviewsCard: React.FC<ReviewsCardProps> = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await profileApi.getUserReviews();
                if (response.success) {
                    setReviews(response.data || []);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá');
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <i
                key={index}
                className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}
                style={{ color: index < rating ? '#ffc107' : '#e9ecef' }}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="profile-card">
                <div className="card-header">
                    <h2>Đánh giá của tôi</h2>
                </div>
                <div className="card-content">
                    <div className="loading-state">
                        <i className="bi bi-arrow-clockwise"></i>
                        <p>Đang tải danh sách đánh giá...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-reviews-card">
            <div className="profile-reviews-header">
                <h2>Đánh giá của tôi</h2>
                <span className="profile-reviews-count">{reviews.length} đánh giá</span>
            </div>

            <div className="profile-reviews-content">
                {error && (
                    <div className="profile-reviews-error">
                        <i className="bi bi-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="profile-reviews-loading">
                        <i className="bi bi-arrow-clockwise"></i>
                        <p>Đang tải danh sách đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="profile-reviews-empty">
                        <i className="bi bi-chat-square-text"></i>
                        <h3>Chưa có đánh giá nào</h3>
                        <p>Bạn chưa đánh giá sản phẩm nào. Hãy mua sắm và chia sẻ trải nghiệm của bạn!</p>
                    </div>
                ) : (
                    <div className="profile-reviews-list">
                        {reviews.map((review) => (
                            <div key={review._id} className="profile-review-item">
                                <div className="profile-review-product">
                                    <img
                                        src={review.product.images[0]?.url || '/placeholder-image.jpg'}
                                        alt={review.product.name}
                                        className="product-image"
                                    />
                                    <div className="product-info">
                                        <h4 className="product-name">{review.product.name}</h4>
                                        <div className="review-rating">
                                            {renderStars(review.rating)}
                                            <span className="rating-text">({review.rating}/5)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-review-content">
                                    <p className="profile-review-comment">{review.comment}</p>
                                    <div className="profile-review-meta">
                                        <span className="review-date">
                                            <i className="bi bi-calendar3"></i>
                                            {formatDate(review.createdAt)}
                                        </span>
                                        {review.updatedAt !== review.createdAt && (
                                            <span className="review-updated">
                                                (Đã chỉnh sửa: {formatDate(review.updatedAt)})
                                            </span>
                                        )}
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

export default ReviewsCard;