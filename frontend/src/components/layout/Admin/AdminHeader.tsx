import { Bell, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import React, { useState, useRef, useEffect } from "react";
import type { RootState } from "../../../redux/store.ts";
import "./AdminHeader.css";
import { getSocket } from "../../../utils/socket.ts";
import { toast } from "react-toastify";
import { disconnectSocket } from "../../../utils/socket.ts";
import { notificationApi } from "../../../api/notificationApi.ts";
import type { Notification } from "../../../types/Notification.ts";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = getSocket();
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  useEffect(() => {
    socket.on("notification", (noti) => {
      toast.info(noti.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // cập nhật state notifications
      setNotifications(prev => [noti, ...prev]);
      console.log("Received notification socket:", noti);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await notificationApi.getNotificationsByUser(user._id);
        if (response.data) setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notiId: string) => {
    try {
      await notificationApi.markAsRead(notiId);
      setNotifications(prev =>
        prev.map(n => (n._id === notiId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };
  const handleLogout = () => {
    // TODO: xóa token / clear localStorage rồi redirect về trang login
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("isAdmin");
      disconnectSocket();
    }
    window.location.href = "/login";
  };

  return (
    <header className="admin-header">
      {/* Slogan */}
      <div className="slogan">
        <h2>✨ Quản trị dễ dàng, vận hành hiệu quả ✨</h2>
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Notifications */}
        <div
          className="uts-notification"
          ref={notificationRef}
          onMouseEnter={() => setIsNotificationOpen(true)}
          onMouseLeave={() => setIsNotificationOpen(false)}
        >
          <button
            className="uts-icon-btn"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <i className="bi bi-bell"></i>
            {notifications.some(n => !n.isRead) && (
              <span className="uts-badge">{notifications.filter(n => !n.isRead).length}</span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="uts-notification-dropdown">
              <div className="uts-noti-header">
                <span>🔔 Thông báo</span>
              </div>
              <div className="uts-noti-list">
                {notifications.length > 0 ? (
                  notifications.map(noti => (
                    <div
                      key={noti._id}
                      className={`uts-noti-item ${noti.isRead ? "read" : "unread"}`}
                      onClick={() => handleMarkAsRead(noti._id)}
                    >
                      <div className="uts-noti-message">{noti.message}</div>
                      <div className="uts-noti-time">
                        {new Date(noti.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="uts-noti-empty">Không có thông báo mới</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="avatar-wrapper">
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="avatar"
            onClick={() => setOpen(!open)}
          />

          {open && (
            <div className="dropdown-menu1">
              <button className="dropdown-item1" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
