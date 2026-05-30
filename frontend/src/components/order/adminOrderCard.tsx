import React, { useState } from "react";
import { Order } from "../../types/Order.ts";
import "./adminOrderCard.css";
import { formatPrice } from "../../utils/format.ts";
import { DownOutlined, RightOutlined } from '@ant-design/icons';

type Props = {
  order: Order;
  onUpdateStatus: (id: string, newStatus: string) => void;
};

const statusText: Record<string, string> = {
  pending: "Chờ xác nhận",
  preparing: "Chuẩn bị hàng",
  delivering: "Đang giao",
  waitdelivered: "Chờ khách hàng xác nhận",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
};

const AdminOrderCard: React.FC<Props> = ({ order, onUpdateStatus }) => {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  const toggleAddressExpand = () => {
    setIsAddressExpanded(!isAddressExpanded);
  };

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-header">
        <span>Mã đơn: {order._id}</span>
        <span className={`status ${order.statusOrder?.toLowerCase()}`}>
          {order.statusOrder === "delivering"
            ? order.isDelivered === true
              ? statusText["waitdelivered"]
              : statusText[order.statusOrder] || order.statusOrder
            : statusText[order.statusOrder] || order.statusOrder}
        </span>

      </div>

      {/* Buyer */}
      <div className="buyer-info">
        <p><b>Khách hàng:</b> {order.user.username}</p>
        <p><b>Email:</b> {order.user.email}</p>
      </div>

      {/* Delivery Address */}
      {order.deliveryAddressId && (
        <div className="delivery-address">
          <div
            className="delivery-address-header"
            onClick={toggleAddressExpand}
          >
            <h4>Địa chỉ giao hàng</h4>
            {isAddressExpanded ? (
              <DownOutlined className="expand-icon" />
            ) : (
              <RightOutlined className="expand-icon" />
            )}
          </div>
          {isAddressExpanded && (
            <div className="delivery-address-details">
              <p><b>Tên người nhận:</b> {order.deliveryAddressId.nameBuyer}</p>
              <p><b>Số điện thoại:</b> {order.deliveryAddressId.phoneNumber}</p>
              <p><b>Địa chỉ:</b> {order.deliveryAddressId.addressName}</p>
              {order.deliveryAddressId.note && (
                <p><b>Ghi chú:</b> {order.deliveryAddressId.note}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item" key={item._id}>
            <img src={item.product.images[0]?.url} alt={item.product.name} />
            <div className="item-info">
              <p className="name">{item.product.name}</p>
              <p>Số lượng: {item.quantity}</p>
              <div className="price">
                <span className="current-price">{formatPrice(item.product.price * item.quantity - item.product.price * item.quantity * item.product.discount * 0.01)}</span>
                {item.product.discount > 0 && (
                  <span className="original-price">{formatPrice(item.product.price * item.quantity)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="order-footer">
        <div className="footer-left">
          <p><i className="fas fa-calendar-alt"></i> Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><i className="fas fa-clock"></i> Cập nhật: {new Date(order.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="footer-right">
          <span className="total-label">Tổng tiền thanh toán:</span>
          <span className="total-value">{order.totalPrice.toLocaleString()} đ</span>
        </div>
      </div>


      {/* Actions */}
      <div className="order-actions">
        {order.statusOrder === "pending" && (
          <>
            <button
              className="btn primary"
              onClick={() => onUpdateStatus(order._id, "preparing")}
            >
              Duyệt đơn
            </button>
            <button
              className="btn danger"
              onClick={() => onUpdateStatus(order._id, "cancelled")}
            >
              Hủy đơn
            </button>
          </>
        )}

        {order.statusOrder === "preparing" && (
          <button
            className="btn primary"
            onClick={() => onUpdateStatus(order._id, "delivering")}
          >
            Bắt đầu giao hàng
          </button>
        )}

        {order.statusOrder === "delivering" && order.isDelivered === false && (
          <button
            className="btn primary"
            onClick={() => onUpdateStatus(order._id, "delivered")}
          >
            Giao hàng thành công
          </button>
        )}


      </div>
    </div>
  );
};

export default AdminOrderCard;
