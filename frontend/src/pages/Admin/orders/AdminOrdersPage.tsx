import React, { useEffect, useState } from "react";
import { adminOrderApi } from "../../../api/adminOrderApi.ts";
import { Order } from "../../../types/Order";
import AdminOrderCard from "../../../components/order/adminOrderCard.tsx";
import "./AdminOrdersPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tabOptions = [
  { key: "all", label: "Tất cả", filter: undefined },
  { key: "pending", label: "Chờ xác nhận", filter: "pending" },
  { key: "preparing", label: "Chuẩn bị hàng", filter: "preparing" },
  { key: "delivering", label: "Đang giao", filter: "delivering" },
  { key: "delivered", label: "Đã giao", filter: "delivered" },
  { key: "completed", label: "Hoàn thành", filter: "completed" },
  { key: "cancelled", label: "Đã hủy", filter: "cancelled" },
];

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const tab = tabOptions.find((t) => t.key === activeTab);
        const res = await adminOrderApi.getOrders(tab?.filter); // gọi API theo tab
        setOrders(res);
      } catch (error) {
        console.error("Fetch orders failed:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]); // gọi lại mỗi khi tab thay đổi

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try{
      await adminOrderApi.updateStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, statusOrder: newStatus } : o
        )
      );
      toast.success("Cập nhật đơn hàng thành công!");
      setActiveTab(newStatus);
    }
    catch{
      toast.error("Cập nhật đơn hàng thất bại!");
    }
  };

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

      {/* Orders */}
      <div className="order-list">
        {loading ? (
          <p>Đang tải...</p>
        ) : orders.length === 0 ? (
          <p className="empty-text">Không có đơn hàng.</p>
        ) : (
          orders.map((order) => (
            <AdminOrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
