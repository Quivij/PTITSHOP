import React, { useState, useEffect } from "react";
import type { User } from "../../types/User";
import { toast } from "react-toastify";

interface PersonalInfoCardProps {
    user: User;
    onUpdate: (data: Partial<User>) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user.fullName ? user.fullName : "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
        gender: user.gender,
    });

    // Update formData when user changes
    useEffect(() => {
        setFormData({
            fullName: (user.fullName && user.fullName !== user.email) ? user.fullName : "",
            phoneNumber: user.phoneNumber || "",
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
            gender: user.gender,
        });
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'radio' ? value === 'true' : value
        }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            fullName: (user.fullName && user.fullName !== user.email) ? user.fullName : "",
            phoneNumber: user.phoneNumber || "",
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
            gender: user.gender,
        });
        setIsEditing(false);
    };

    return (
        <div className="profile-card">
            <div className="card-header">
                <h2>Thông tin cá nhân</h2>
                {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil"></i>
                        Chỉnh sửa
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="cancel-btn" onClick={handleCancel}>
                            Hủy
                        </button>
                        <button className="save-btn" onClick={handleSave}>
                            Lưu
                        </button>
                    </div>
                )}
            </div>
            <div className="card-content">
                <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="form-input"
                        style={{ backgroundColor: '#f8f9fa', color: '#666' }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>Email không thể thay đổi</small>
                </div>
                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Chưa cập nhật"
                        readOnly={!isEditing}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Giới tính</label>
                    <div className="gender-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="true"
                                checked={formData.gender === true}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="form-radio"
                            />
                            <span>Nam</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="false"
                                checked={formData.gender === false}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="form-radio"
                            />
                            <span>Nữ</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoCard;
