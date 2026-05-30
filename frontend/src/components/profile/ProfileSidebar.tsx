import React from "react";

interface ProfileSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: 'bi-person' },
        { id: 'orders', label: 'Đơn hàng của tôi', icon: 'bi-bag' },
        { id: 'favorites', label: 'Sản phẩm yêu thích', icon: 'bi-heart' },
        { id: 'viewed', label: 'Sản phẩm đã xem', icon: 'bi-eye' },  
        { id: 'reviews', label: 'Đánh giá của tôi', icon: 'bi-star' },
        { id: 'settings', label: 'Cài đặt', icon: 'bi-gear' },
    ];

    return (
        <div className="profile-sidebar">
            <nav className="profile-nav">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default ProfileSidebar;
