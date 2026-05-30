import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUser,
  FiEdit2,
  FiSave,
  FiExternalLink,
} from "react-icons/fi";
import "./UserDetailModal.css";
import { User } from "../../../types/UserAdmin";
import { adminOrderApi } from "../../../api/adminOrderApi.ts";
import { adminUpdateUserProfile } from "../../../api/adminApis.ts";

type ExtendedUser = User & {
  _id?: any;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date | { $date?: string };
};

interface Order {
  id: string;
  date: string;
  itemsCount: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";
}

const parseDate = (v?: any) => {
  if (!v) return "";
  try {
    const d =
      typeof v === "string"
        ? new Date(v)
        : v instanceof Date
          ? v
          : new Date(v.$date ?? v);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
};

const formatDateDisplay = (v?: any) => {
  if (!v) return "-";
  try {
    return new Date(typeof v === "string" ? v : v.$date ?? v).toLocaleDateString(
      "vi-VN"
    );
  } catch {
    return String(v);
  }
};

const getId = (u: ExtendedUser) =>
  u.id ?? (u._id ? (typeof u._id === "string" ? u._id : u._id.toString()) : "-");
const getPhone = (u: ExtendedUser) => u.phone ?? u.phoneNumber ?? "-";
const getRole = (u: ExtendedUser) => (u.isAdmin ? "ADMIN" : u.role ?? "USER");

const UserDetailModal: React.FC<{
  user: User | null;
  onClose: () => void;
  onSave: (u: User) => void;
}> = ({ user, onClose, onSave }) => {
  const [edit, setEdit] = useState<ExtendedUser | null>(user as ExtendedUser | null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setEdit(user ? ({ ...user } as ExtendedUser) : null);
    setIsEditing(false);
    setActiveTab("info");

    const idKey = (user?.id ?? (user as any)?._id ?? "") as string;
    if (!idKey) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        console.log("[UserDetailModal] fetching orders for user:", idKey);
        const fetched = await adminOrderApi.getOrdersByUserId(idKey);
        console.log("[UserDetailModal] fetched raw orders:", fetched);

        const rawOrders = Array.isArray(fetched)
          ? fetched
          : fetched?.data || fetched?.orders || [];

        if (!Array.isArray(rawOrders)) {
          console.warn("[UserDetailModal] rawOrders is not an array");
          setOrders([]);
          return;
        }

        const mapped = rawOrders.map((o: any) => {
          const items = Array.isArray(o.items) ? o.items : [];
          const itemsCount = items.reduce(
            (sum: number, it: any) => sum + (Number(it.quantity) || 0),
            0
          );

          let total = Number(o.totalPrice ?? 0);
          if (!total && items.length) {
            total = items.reduce((sum: number, it: any) => {
              const prod = it.product ?? {};
              const price = Number(prod.price ?? 0);
              const discount = Number(prod.discount ?? 0);
              const qty = Number(it.quantity ?? 0);
              const priceAfterDiscount = Math.round(price * (1 - discount / 100));
              return sum + priceAfterDiscount * qty;
            }, 0);
          }
          //const rawStatus = (o.status ?? o.statusOrder ?? "pending")
          const rawStatus = (o.statusOrder ?? "unknown")
            .toString()
            .toLowerCase();
          const statusMap: Record<string, string> = {
            paid: "Paid",
            pending: "Pending",
            cancelled: "Cancelled",
            shipped: "Shipped",
            completed: "Completed",
            processing: "Processing",
          };
          const status =
            statusMap[rawStatus] ??
            rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

          return {
            id: String(o._id ?? o.id ?? ""),
            date: formatDateDisplay(o.createdAt),
            itemsCount,
            total,
            status: status as Order["status"],
          } as Order;
        });

        if (!cancelled) setOrders(mapped);
      } catch (err) {
        console.error("[UserDetailModal] getOrdersByUserId error:", err);
        if (!cancelled) setOrders([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);


  if (!user || !edit) return null;

  const handleSave = async () => {
    if (!edit) return;
    const userId = getId(edit);
    if (!userId || userId === "-") {
      toast.error("ID người dùng không hợp lệ");
      return;
    }

    // prepare payload per API example
    const payload: any = {
      fullName: edit.fullName,
      username: edit.username,
      email: edit.email,
      phoneNumber: edit.phone ?? edit.phoneNumber,
      isActive: !!edit.isActive,
    };
    // optionally include dateOfBirth normalized
    if (edit.dateOfBirth) {
      const parsed = parseDate(edit.dateOfBirth);
      if (parsed) payload.dateOfBirth = new Date(parsed).toISOString();
    }

    setSaving(true);
    try {
      const res = await adminUpdateUserProfile(userId, payload);
      // if API returns updated user object use it, otherwise fallback to local edit
      const updatedUser = (res && (res.data ?? res.user ?? res.updatedUser)) ? (res.data ?? res.user ?? res.updatedUser) : edit;
      // normalize and call parent
      onSave(updatedUser as User);
      toast.success(res?.message ?? "Cập nhật thông tin thành công");
      setIsEditing(false);
      setEdit({ ...edit, ...payload } as ExtendedUser);
    } catch (err: any) {
      console.error("[UserDetailModal] adminUpdateUserProfile error:", err);
      toast.error(err?.message || "Cập nhật thông tin thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEdit({ ...user } as ExtendedUser);
    setIsEditing(false);
  };

  const handleOpenOrder = (orderId: string) => {
    console.log("[UserDetailModal] open order", orderId);
    // TODO: navigate to order detail or open modal
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="user-header-content">
            <div className="user-avatar-wrapper">
              <div className="user-avatar-large">
                {(edit.fullName || "?").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="header-info">
              <div className="user-name-row">
                <h2 className="user-name">{edit.fullName}</h2>
                <div className="header-badges">
                  <span
                    className={`status-badge ${edit.isActive ? "badge-active" : "badge-inactive"
                      }`}
                  >
                    {edit.isActive ? "Hoạt động" : "Đã khóa"}
                  </span>
                  <span
                    className={`status-badge ${getRole(edit) === "ADMIN" ? "badge-admin" : "badge-user"
                      }`}
                  >
                    {getRole(edit)}
                  </span>
                </div>
              </div>

              <div className="user-meta">
                <div className="meta-item">
                  <FiMail size={14} />
                  <span>{edit.email || "-"}</span>
                </div>
                <div className="meta-item">
                  <FiPhone size={14} />
                  <span>{getPhone(edit)}</span>
                </div>
                <div className="meta-item">
                  <FiCalendar size={14} />
                  <span>Tham gia {formatDateDisplay(edit.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* {!isEditing ? (
              <button
                className="btn tiny"
                title="Chỉnh sửa"
                onClick={() => setIsEditing(true)}
                aria-label="Chỉnh sửa"
              >
                <FiEdit2 />
              </button>
            ) : (
              <>
                <button
                  className="btn tiny primary"
                  onClick={handleSave}
                  title="Lưu"
                  aria-label="Lưu"
                >
                  <FiSave />
                </button>
                <button
                  className="btn tiny"
                  onClick={handleCancel}
                  title="Hủy"
                  aria-label="Hủy"
                >
                  Hủy
                </button>
              </>
            )} */}

            <button className="btn-close" onClick={onClose} aria-label="Đóng">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="modal-tabs" style={{ padding: "12px 20px" }}>
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <FiUser size={16} />
            <span>Thông tin</span>
          </button>

          <button
            className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            style={{ marginLeft: 12 }}
            title="Lịch sử đơn hàng"
          >
            <span>Lịch sử đơn hàng</span>
            <span className="tab-badge" style={{ marginLeft: 8 }}>{orders.length}</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Single left column editable or orders list */}
          {activeTab === "info" ? (
            <div className="details-container" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <div className="info-card edit-card">
                  <div className="card-header">
                    <h3>
                      <FiUser size={18} /> Thông tin cơ bản
                    </h3>
                  </div>

                  <div className="card-body">
                    <label className="info-row">
                      <span className="label">Mã người dùng</span>
                      <span className="value mono">{getId(edit)}</span>
                    </label>

                    <label className="info-row">
                      <span className="label">Họ và tên</span>
                      {isEditing ? (
                        <input
                          value={edit.fullName || ""}
                          onChange={(e) =>
                            setEdit({ ...edit, fullName: e.target.value })
                          }
                          placeholder="Họ và tên"
                        />
                      ) : (
                        <span className="value">{edit.fullName}</span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Tên đăng nhập</span>
                      {isEditing ? (
                        <input
                          value={edit.username || ""}
                          onChange={(e) =>
                            setEdit({ ...edit, username: e.target.value })
                          }
                          placeholder="Username"
                        />
                      ) : (
                        <span className="value">{edit.username || "-"}</span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Email</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={edit.email || ""}
                          onChange={(e) =>
                            setEdit({ ...edit, email: e.target.value })
                          }
                          placeholder="Email"
                        />
                      ) : (
                        <span className="value">{edit.email}</span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Số điện thoại</span>
                      {isEditing ? (
                        <input
                          value={edit.phone ?? edit.phoneNumber ?? ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              phoneNumber: e.target.value,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Phone"
                        />
                      ) : (
                        <span className="value">{getPhone(edit)}</span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Ngày sinh</span>
                      {isEditing ? (
                        <input
                          type="date"
                          value={parseDate(edit.dateOfBirth)}
                          onChange={(e) =>
                            setEdit({ ...edit, dateOfBirth: e.target.value })
                          }
                        />
                      ) : (
                        <span className="value">
                          {formatDateDisplay(edit.dateOfBirth)}
                        </span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Địa chỉ</span>
                      {isEditing ? (
                        <input
                          value={edit.address ?? ""}
                          onChange={(e) =>
                            setEdit({ ...edit, address: e.target.value })
                          }
                          placeholder="Địa chỉ"
                        />
                      ) : (
                        <span className="value">{edit.address || "-"}</span>
                      )}
                    </label>

                    <label className="info-row">
                      <span className="label">Vai trò</span>
                      {/* Role is read-only — do not allow editing */}
                      <span className="value">{getRole(edit)}</span>
                    </label>

                    <label className="info-row">
                      <span className="label">Trạng thái</span>
                      {isEditing ? (
                        <select
                          value={edit.isActive ? "active" : "inactive"}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              isActive: e.target.value === "active",
                            })
                          }
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Đã khóa</option>
                        </select>
                      ) : (
                        <span className="value">
                          {edit.isActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                      )}
                    </label>

                    {/* <label className="info-row">
                      <span className="label">Ghi chú</span>
                      {isEditing ? (
                        <input
                          value={edit.note ?? ""}
                          onChange={(e) => setEdit({ ...edit, note: e.target.value })}
                          placeholder="Ghi chú"
                        />
                      ) : (
                        <span className="value">{edit.note || "-"}</span>
                      )}
                    </label> */}

                    <div
                      className="action-row"
                      style={{
                        justifyContent: "flex-end",
                        marginTop: 12,
                      }}
                    >
                      {!isEditing ? (
                        <button className="btn ghost" onClick={() => setIsEditing(true)}>
                          Chỉnh sửa
                        </button>
                      ) : (
                        <>
                          <button className="btn ghost" onClick={handleCancel} disabled={saving}>
                            Hủy
                          </button>
                          <button className="btn primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ORDERS TAB
            <div className="orders-section">
              <div className="info-card">
                <div className="card-header">
                  <h3>Lịch sử đơn hàng</h3>
                </div>

                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="empty-state">Tài khoản chưa có đơn hàng.</div>
                  ) : (
                    <div className="orders-table-wrap">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Mã đơn</th>
                            <th>Ngày</th>
                            <th>Số mặt hàng</th>
                            <th>Tổng</th>
                            <th>Trạng thái</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id}>
                              <td className="mono">{o.id}</td>
                              <td>{o.date}</td>
                              <td>{o.itemsCount}</td>
                              <td>{o.total.toLocaleString()} VND</td>
                              <td>
                                <span className={`order-status ${o.status.toLowerCase()}`}>
                                  {o.status}
                                </span>
                              </td>
                              {/* <td className="actions">
                                <button
                                  className="btn tiny"
                                  onClick={() => handleOpenOrder(o.id)}
                                  title="Xem chi tiết đơn"
                                >
                                  <FiExternalLink />
                                </button>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;