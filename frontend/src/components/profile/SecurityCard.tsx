import React from "react";

const SecurityCard: React.FC = () => {
    return (
        <div className="profile-card">
            <div className="card-header">
                <h2>Bảo mật</h2>
            </div>
            <div className="card-content">
                <div className="security-item">
                    <div className="security-info">
                        <h3>Mật khẩu</h3>
                        <p>Đã cập nhật lần cuối: 3 tháng trước</p>
                    </div>
                    <button className="change-btn">Thay đổi</button>
                </div>
                <div className="security-item">
                    <div className="security-info">
                        <h3>Xác thực 2 bước</h3>
                        <p>Tăng cường bảo mật cho tài khoản</p>
                    </div>
                    <button className="change-btn">Bật</button>
                </div>
                <div className="security-item">
                    <div className="security-info">
                        <h3>Phiên đăng nhập</h3>
                        <p>Quản lý các thiết bị đã đăng nhập</p>
                    </div>
                    <button className="change-btn">Xem</button>
                </div>
            </div>
        </div>
    );
};

export default SecurityCard;
