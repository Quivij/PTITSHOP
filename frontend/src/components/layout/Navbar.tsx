// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice.ts";
import type { RootState } from "../../redux/store.ts";
import { useCart } from "../../hooks/useCart.ts";
import { disconnectSocket } from "../../utils/socket.ts";
import { notificationApi } from "../../api/notificationApi.ts";
import type { Notification } from "../../types/Notification.ts";
import "./Navbar.css";
import { getSocket } from "../../utils/socket.ts";
import { toast } from "react-toastify";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { cartCount } = useCart();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const socket = getSocket();

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

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate("/home");
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleProfileClick = () => { navigate("/profile"); setIsUserDropdownOpen(false); };
  const handleOrdersClick = () => { navigate("/orders"); setIsUserDropdownOpen(false); };
  const handleFavoriteClick = () => { if (!user) { navigate("/login"); return; } navigate("/profile?tab=favorites"); setIsUserDropdownOpen(false); };
  const handleCartClick = () => { if (!user) { navigate("/login"); return; } navigate("/cart"); setIsUserDropdownOpen(false); };

  return (
    <nav className="uts-navbar">
      <div className="uts-container">
        <div className="uts-container left">
           {/* Logo */}
        <Link className="uts-logo" to="/">
          {/* <img src="https://portal.ptit.edu.vn/wp-content/uploads/2016/04/ptit-logo.png" alt="logo" className="uts-logo-img" /> */}
          <span className="uts-logo-text">PTITShop</span>
        </Link>

        {/* Menu */}
        <ul className="uts-navlinks">
          <li><Link to="/home">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/about">Giới thiệu</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
        </ul>

        {/* Search bar */}
        {/* <div className="uts-search">
          <input type="text" placeholder="Tìm kiếm sản phẩm, danh mục hoặc thương hiệu..." />
          <button><i className="bi bi-search"></i></button>
        </div> */}

        
        </div>
            
        <div>
          {/* Actions */}
        <div className="uts-actions">
          {/* Wishlist */}
          <button className="uts-icon-btn" onClick={handleFavoriteClick}>
            <i className="bi bi-heart"></i>
            {user?.favProducts?.length ? <span className="uts-badge">{user.favProducts.length}</span> : null}
          </button>

          {/* Cart */}
          <button className="uts-icon-btn position-relative" onClick={handleCartClick}>
            <i className="bi bi-cart"></i>
            <span className="uts-badge">{cartCount}</span>
          </button>

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
           {/* User info */}
          {token && user ? (
            <div className="uts-user-info" ref={userDropdownRef}>
              <span className="uts-username" onClick={toggleUserDropdown}>
                Xin chào, {user.fullName} <i className={`bi bi-chevron-${isUserDropdownOpen ? "up" : "down"}`}></i>
              </span>
              {isUserDropdownOpen && (
                <div className="uts-dropdown-menu">
                  <div className="uts-dropdown-item" onClick={handleProfileClick}><i className="bi bi-person"></i> Profile</div>
                  <div className="uts-dropdown-item" onClick={handleOrdersClick}><i className="bi bi-bag"></i> Đơn hàng của tôi</div>
                  <div className="uts-dropdown-divider"></div>
                  <div className="uts-dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="uts-btn uts-btn-login" onClick={() => navigate("/login")}>Đăng nhập</button>
              <button className="uts-btn uts-btn-signup" onClick={() => navigate("/register")}>Đăng ký</button>
            </>
          )}
        </div>
      </div>


         
      </div>
    </nav>
  );
};

export default Navbar;
