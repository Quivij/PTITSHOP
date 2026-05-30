import React, { useState } from "react";
import "./OrdersPage.css";

type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

interface Order {
  id: string;
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

const orders: Order[] = [
  {
    id: "DH001",
    date: "2025-09-10",
    total: 1250000,
    status: "DELIVERING",
    items: [
      {
        name: "Áo thun nam PTITShop",
        qty: 2,
        price: 250000,
        image:
          "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
      {
        name: "Giày sneaker trắng",
        qty: 1,
        price: 750000,
        image:
            "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
        },
    ],
  },
  {
    id: "DH002",
    date: "2025-09-05",
    total: 450000,
    status: "COMPLETED",
    items: [
      {
        name: "Tai nghe Bluetooth",
        qty: 1,
        price: 450000,
        image:
          "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
    ],
  },
  {
    id: "DH003",
    date: "2025-09-01",
    total: 300000,
    status: "CANCELLED",
    items: [
      {
        name: "Balo laptop",
        qty: 1,
        price: 300000,
        image:
          "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
      },
    ],
  },
  {
    id: "DH004",
    date: "2025-09-12",
    total: 600000,
    status: "NEW",
    items: [
      {
        name: "Sách lập trình React",
        qty: 2,
        price: 300000,
        image:
          "https://yeepvn.sgp1.digitaloceanspaces.com/2023/03/5e5810c08b119e845934bc8348a71aef.jpg",
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
  { key: "new", label: "Chờ xác nhận", filter: ["NEW", "CONFIRMED"] },
  { key: "preparing", label: "Chuẩn bị hàng", filter: ["PREPARING"] },
  { key: "delivering", label: "Đang giao", filter: ["DELIVERING"] },
  { key: "completed", label: "Hoàn thành", filter: ["COMPLETED"] },
  { key: "cancelled", label: "Đã hủy", filter: ["CANCELLED"] },
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
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
      <h2>Đơn hàng của tôi</h2>

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
          <p className="empty-text">Chưa có đơn hàng nào.</p>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.includes(order.id);
            const showSeeMore = order.items.length > 1;

            return (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <span>Mã đơn: {order.id}</span>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {statusText[order.status]}
                  </span>
                </div>

                <div className="order-items">
                  {(isExpanded ? order.items : order.items.slice(0, 1)).map(
                    (item, index) => (
                      <div className="order-item" key={index}>
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <p className="name">{item.name}</p>
                          <p className="qty">Số lượng: {item.qty}</p>
                          <p className="price">
                            {item.price.toLocaleString()} đ
                          </p>
                          {/* Actions cho từng sản phẩm (COMPLETED) */}
                          {order.status === "COMPLETED" && (
                            <div className="item-actions">
                              <button className="btn small">Đánh giá</button>
                              <button className="btn small">Mua lại</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                  {showSeeMore && (
                    <button
                      className="see-more-btn"
                      onClick={() => toggleExpand(order.id)}
                    >
                      {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </div>

                <div className="order-footer">
                  <span>Ngày đặt: {order.date}</span>
                  <span className="total">
                    Tổng: {order.total.toLocaleString()} đ
                  </span>
                </div>

                {/* Action buttons theo trạng thái đơn */}
                <div className="order-actions">
                  {order.status === "DELIVERING" && (
                    <button className="btn primary">Đã nhận hàng</button>
                  )}
                  {(order.status === "NEW" || order.status === "CONFIRMED") && (
                    <button className="btn danger">Hủy đơn hàng</button>
                  )}
                  {order.status === "CANCELLED" && (
                    <button className="btn secondary">Mua lại</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
