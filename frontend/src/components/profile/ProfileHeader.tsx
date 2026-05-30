import React, { useEffect, useRef, useState } from "react";
import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../../api/profileApi.ts";

interface ProfileHeaderProps {
    user: User;
}

interface UserStats {
    orders: number;
    reviews: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats>({ orders: 0, reviews: 0 });
    const [loadingStats, setLoadingStats] = useState(false);
    const navigate = useNavigate();

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // Load user stats (orders and reviews count)
    useEffect(() => {
        const loadUserStats = async () => {
            try {
                setLoadingStats(true);
                const response = await profileApi.getUserStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Error loading user stats:', error);
                // Keep default values if API fails
            } finally {
                setLoadingStats(false);
            }
        };

        if (user) {
            loadUserStats();
        }
    }, [user]);

    useEffect(() => {
        // Cleanup blob URL khi component unmount hoặc preview thay đổi
        return () => {
            if (previewAvatar) {
                URL.revokeObjectURL(previewAvatar);
            }
        };
    }, [previewAvatar]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("File đã chọn:", file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
        e.target.value = '';    // cho phép chọn lại ảnh vừa chọn trước đó
    };

    const handleTabClick = (tab: string) => {
        navigate(`/profile?tab=${tab}`);
    };

    const handleOrdersClick = () => {
        navigate("/orders");
    };

    return (
        <div className="profile-header">
            <div className="profile-avatar" onClick={handleAvatarClick}>
                <img
                    src={previewAvatar || user.avt || "https://via.placeholder.com/120x120/6f42c1/ffffff?text=U"}
                    alt="Avatar"
                    className="avatar-img"
                />
                <button className="avatar-edit-btn">
                    <i className="bi bi-camera"></i>
                </button>
                {/* input file ẩn */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>
            <div className="profile-info">
                <h1 className="profile-name">
                    {(user.fullName && user.fullName !== user.email)
                        ? user.fullName
                        : user.username || "Người dùng"}
                </h1>
                <p className="profile-email">{user.email}</p>
                <div className="profile-stats">
                    <div className="stat-item" onClick={handleOrdersClick}>
                        <span className="profile-stat-number">
                            {loadingStats ? "..." : stats.orders}
                        </span>
                        <span className="profile-stat-label">Đơn hàng</span>
                    </div>
                    <div className="stat-item" onClick={() => handleTabClick('reviews')}>
                        <span className="profile-stat-number">
                            {loadingStats ? "..." : stats.reviews}
                        </span>
                        <span className="profile-stat-label">Đánh giá</span>
                    </div>
                    <div className="stat-item" onClick={() => handleTabClick('favorites')}>
                        <span className="profile-stat-number">{user.favProducts.length}</span>
                        <span className="profile-stat-label">Yêu thích</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
