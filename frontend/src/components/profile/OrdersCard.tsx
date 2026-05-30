import React from "react";

const OrdersCard: React.FC = () => {
    // Mock data - sẽ được thay thế bằng API call
    const orders = [
        {
            id: "ORD001",
            date: "2024-01-15",
            status: "Đã giao",
            total: 1500000,
            items: 3
        },
        {
            id: "ORD002",
            date: "2024-01-10",
            status: "Đang giao",
            total: 800000,
            items: 2
        },
        {
            id: "ORD003",
            date: "2024-01-05",
            status: "Đã hủy",
            total: 1200000,
            items: 1
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Đã giao":
                return "status-delivered";
            case "Đang giao":
                return "status-shipping";
            case "Đã hủy":
                return "status-cancelled";
            default:
                return "status-pending";
        }
    };

    return (
        <div className="profile-card">
            <div className="card-header">
                <h2>Đơn hàng của tôi</h2>
                <button className="view-all-btn">
                    Xem tất cả
                </button>
            </div>
            <div className="card-content">
                {orders.length > 0 ? (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-item">
                                <div className="order-info">
                                    <div className="order-header">
                                        <span className="order-id">#{order.id}</span>
                                        <span className={`order-status ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="order-details">
                                        <p className="order-date">Ngày đặt: {order.date}</p>
                                        <p className="order-items">{order.items} sản phẩm</p>
                                    </div>
                                </div>
                                <div className="order-total">
                                    <span className="total-amount">
                                        {order.total.toLocaleString('vi-VN')}đ
                                    </span>
                                    <button className="order-detail-btn">
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="bi bi-bag"></i>
                        <p>Bạn chưa có đơn hàng nào</p>
                        <button className="shop-now-btn">
                            Mua sắm ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersCard;
