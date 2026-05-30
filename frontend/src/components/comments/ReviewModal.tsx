import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reviewApi } from '../../api/reviewApi.ts';
import './ReviewModal.css';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productId: string;
    productName: string;
    productImage?: string;
    onSubmitted?: () => void;
    onReward?: (reward: any) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    orderId,
    productId,
    productName,
    productImage,
    onSubmitted,
    onReward,
}) => {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (comment.trim().length < 10) {
            toast.error('Bình luận phải có ít nhất 10 ký tự');
            return;
        }

        try {
            setSubmitting(true);
            const res = await reviewApi.createReview({
                orderId,
                productId,
                rating,
                comment: comment.trim()
            });

            if (res.success) {
                toast.success('Đánh giá thành công!');

                // kiểm tra reward
                if (res.reward) {
                    onReward?.(res.reward);
                }

                setRating(5);
                setComment('');
                onClose();

                if (onSubmitted) {
                    onSubmitted();
                }
            }

        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={handleOverlayClick}>
            <div className="review-modal">
                <div className="modal-header">
                    <h3>Đánh giá sản phẩm</h3>
                    <button
                        className="close-button"
                        onClick={onClose}
                        type="button"
                        disabled={submitting}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {/* Product Info */}
                    <div className="product-info-review">
                        {productImage && (
                            <img src={productImage} alt={productName} className="product-image-review" />
                        )}
                        <div className="product-details-review">
                            <p className="product-name-review">{productName}</p>
                        </div>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="rating-section">
                            <label>Đánh giá của bạn:</label>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star ${star <= rating ? 'active' : 'faded'}`}
                                        onClick={() => setRating(star)}
                                        disabled={submitting}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                            <span className="rating-text">
                                {rating === 1 && 'Rất tệ'}
                                {rating === 2 && 'Tệ'}
                                {rating === 3 && 'Bình thường'}
                                {rating === 4 && 'Tốt'}
                                {rating === 5 && 'Rất tốt'}
                            </span>
                        </div>

                        <div className="comment-section">
                            <label htmlFor="comment">Nhận xét:</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)..."
                                rows={4}
                                required
                                minLength={10}
                                disabled={submitting}
                            />
                            <div className="comment-count">
                                {comment.length}/500 ký tự
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={submitting || comment.trim().length < 10}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;