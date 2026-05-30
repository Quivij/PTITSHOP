import React from 'react';
import './RewardModal.css';

interface RewardModalProps {
    reward: any;
    onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward, onClose }) => {
    if (!reward) return null;

    return (
        <div className="reward-modal-overlay" onClick={onClose}>
            <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
                <h3>🎉 Chúc mừng bạn!</h3>

                {reward.type === 'voucher' ? (
                    <div className="reward-content">
                        <p>Bạn vừa nhận được một <b>voucher</b>:</p>
                        <p><b>Mã:</b> {reward.code}</p>
                        <p><b>Giá trị:</b> {reward.discountValue} {reward.discountType === 'percentage' ? '%' : 'VNĐ'}</p>
                        <p><b>Hạn sử dụng:</b> {new Date(reward.expiryDate).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <div className="reward-content">
                        <p>Bạn vừa nhận được <b>{reward.amount}</b> điểm thưởng 🎁</p>
                    </div>
                )}

                <button className="btn-close" onClick={onClose}></button>
            </div>
        </div>
    );
};

export default RewardModal;
