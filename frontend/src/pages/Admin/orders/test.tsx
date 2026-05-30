import React, { useState } from "react";
import "./AdminOrdersPage.css";

type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

interface Order {
  id: string;
  buyer: { name: string; email: string };
  date: string;
  total: number;
  status: OrderStatus;
  items: {
    name: string;
    qty: number;
    price: number;
    image: string;
  }[];
}

const ordersData: Order[] = [
  {
    id: "DH001",
    buyer: { name: "Nguyễn Văn A", email: "a@example.com" },
    date: "2025-09-10",
    total: 1250000,
    status: "DELIVERING",
    items: [
      {
        name: "Áo thun nam PTITShop",
        qty: 2,
        price: 250000,
        image: "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
      {
        name: "Giày sneaker trắng",
        qty: 1,
        price: 750000,
        image: "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
    ],
  },
  {
    id: "DH002",
    buyer: { name: "Trần Thị B", email: "b@example.com" },
    date: "2025-09-05",
    total: 450000,
    status: "NEW",
    items: [
      {
        name: "Tai nghe Bluetooth",
        qty: 1,
        price: 450000,
        image: "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
    ],
  },
];

const statusText: Record<OrderStatus, string> = {
  NEW: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Chuẩn bị hàng",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const tabOptions: { key: string; label: string; filter?: OrderStatus[] }[] = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Chờ duyệt", filter: ["NEW"] },
  { key: "preparing", label: "Chuẩn bị hàng", filter: ["PREPARING"] },
  { key: "delivering", label: "Đang giao", filter: ["DELIVERING"] },
  { key: "completed", label: "Hoàn thành", filter: ["COMPLETED"] },
  { key: "cancelled", label: "Đã hủy", filter: ["CANCELLED"] },
];

const AdminOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>(ordersData);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) =>
          tabOptions.find((t) => t.key === activeTab)?.filter?.includes(o.status)
        );

  return (
    <div className="orders-page">
      <h2>Quản lý đơn hàng</h2>

      {/* Tabs */}
      <div className="order-tabs">
        {tabOptions.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <p className="empty-text">Không có đơn hàng.</p>
        ) : (
          filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <span>Mã đơn: {order.id}</span>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {statusText[order.status]}
                </span>
              </div>

              {/* Buyer Info */}
              <div className="buyer-info">
                <p><b>Khách hàng:</b> {order.buyer.name}</p>
                <p><b>Email:</b> {order.buyer.email}</p>
              </div>

              {/* Items */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <p className="name">{item.name}</p>
                      <p>Số lượng: {item.qty}</p>
                      <p className="price">
                        {(item.price * item.qty).toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-footer">
                <span>Ngày đặt: {order.date}</span>
                <span className="total">
                  Tổng: {order.total.toLocaleString()} đ
                </span>
              </div>

              {/* Admin Actions */}
              <div className="order-actions">
                {order.status === "NEW" && (
                  <>
                    <button
                      className="btn primary"
                      onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                    >
                      Duyệt đơn
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                    >
                      Hủy đơn
                    </button>
                  </>
                )}

                {order.status === "CONFIRMED" && (
                  <button
                    className="btn primary"
                    onClick={() => updateOrderStatus(order.id, "PREPARING")}
                  >
                    Chuyển sang chuẩn bị
                  </button>
                )}

                {order.status === "PREPARING" && (
                  <button
                    className="btn primary"
                    onClick={() => updateOrderStatus(order.id, "DELIVERING")}
                  >
                    Giao hàng
                  </button>
                )}

                {order.status === "DELIVERING" && (
                  <button
                    className="btn primary"
                    onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                  >
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
