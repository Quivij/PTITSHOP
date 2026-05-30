import { useEffect, useState } from "react";
import FavoritesCard from "../../components/profile/FavoritesCard.tsx";
import OrdersCard from "../../components/profile/OrdersCard.tsx";
import PersonalInfoCard from "../../components/profile/PersonalInfoCard.tsx";
import ReviewsCard from "../../components/profile/ReviewsCard.tsx";
import "../../components/profile/ProfileComponents.css";
import ProfileHeader from "../../components/profile/ProfileHeader.tsx";
import ProfileSidebar from "../../components/profile/ProfileSidebar.tsx";
import SecurityCard from "../../components/profile/SecurityCard.tsx";
import { useProfile } from "../../hooks/useProfile.ts";
import type { User } from "../../types/User";
import "./ProfilePage.css";
import ViewedProductsCard from "../../components/profile/ViewedProductsCard.tsx";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
export default function ProfilePage() {
    const { user, loading, error, updateProfile } = useProfile();
    const [activeTab, setActiveTab] = useState('personal')
    const [searchParams] = useSearchParams();;
    // const [stats, setStats] = useState({
    //     orders: 12,
    //     reviews: 5,
    //     favorites: 2
    // });

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleUpdateProfile = async (data: Partial<User>) => {
        try {
            await updateProfile(data);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const renderContent = () => {
        if (!user) return null;

        switch (activeTab) {
            case 'personal':
                return <PersonalInfoCard user={user} onUpdate={handleUpdateProfile} />;
            case 'orders':
                return <OrdersCard />;
            case 'favorites':
                return <FavoritesCard favProducts={user.favProducts} />;
            case 'viewed':
                return <ViewedProductsCard viewedProducts={user.viewedProducts} />;
            case 'reviews':
                return <ReviewsCard />;


            // case 'security':
            //     return <SecurityCard />;
            default:
                return <PersonalInfoCard user={user} onUpdate={handleUpdateProfile} />;
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="loading-state">
                        <i className="bi bi-arrow-clockwise"></i>
                        <p>Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="error-state">
                        <i className="bi bi-exclamation-triangle"></i>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="error-state">
                        <i className="bi bi-exclamation-triangle"></i>
                        <p>Không thể tải thông tin người dùng</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Error notification */}
                {error && (
                    <div className="error-notification">
                        <i className="bi bi-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Header */}
                <ProfileHeader user={user} />

                {/* Content */}
                <div className="profile-content">
                    <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="profile-main">
                        {renderContent()}
                        {activeTab === 'personal' && <SecurityCard />}
                    </div>
                </div>
            </div>
            {/* <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            /> */}
        </div>
    );
}
