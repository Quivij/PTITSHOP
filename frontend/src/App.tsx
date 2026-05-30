import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { profileApi } from "./api/profileApi.ts";

// admin pages
import DashboardPage from "./pages/Admin/dashboard/DashboardPage.tsx";
import AdminProductsPage from "./pages/Admin/products/AdminProductsPage.tsx";
import AdminOrdersPage from "./pages/Admin/orders/AdminOrdersPage.tsx";

//import AdminReportsPage from "./pages/Admin/reports/AdminReportsPage.tsx";
import AdminUsersPage from "./pages/Admin/users/AdminUsersPage.tsx";

// layouts
import ClientLayout from "./components/layout/ClientLayout.tsx";
import AdminLayout from "./components/layout/Admin/AdminLayout.tsx";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.tsx";
import HomePage from "./pages/auth/HomePage.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage.tsx";
import CartPage from "./pages/cart/CartPage.tsx";
import OrdersPage from "./pages/Order/OrdersPage.tsx";
import CategoryPage from "./pages/products/CategoryPage.tsx";
import ProductDetailPage from "./pages/products/ProductDetailPage.tsx";
import ProductsPage from "./pages/products/ProductsPage.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import { setToken, updateUser } from "./redux/authSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "./utils/socket.ts";

import { PrivateRoute } from "./components/PrivateRoute.tsx";
import { AdminRoute } from "./components/AdminRoute.tsx";
import CheckoutPage from "./pages/Checkout/CheckoutPage.tsx";
import { ToastContainer } from "react-toastify";
import PaymentCallbackPage from "./pages/Checkout/PaymentCallbackPage.tsx";

import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (token) {
          dispatch(setToken({ token, refreshToken: refreshToken ?? undefined }));
        }

        // Gọi API lấy thông tin user
        const response = await profileApi.getProfile();
        if (response?.data) {
          dispatch(updateUser(response.data));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      const socket = getSocket();
      socket.emit("register", user._id);
      console.log("Socket connected for user:", user._id);
    }
  }, [user]);


  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Client */}
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
          <Route element={
            <PrivateRoute>
              <ClientLayout />
            </PrivateRoute>

          }>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            {/* <Route path="reports" element={<AdminReportsPage />} /> */}
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} newestOnTop />
    </>
  );


  // return (
  //   <BrowserRouter>
  //     <Header />
  //     <Navbar />
  //     <Body>
  //       <Routes>
  //         <Route path="/" element={<Navigate to="/home" />} />
  //         <Route path="/home" element={<HomePage />} />
  //         <Route path="/login" element={<LoginPage />} />
  //         <Route path="/register" element={<RegisterPage />} />
  //         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  //         <Route path="/verify-otp" element={<VerifyOtpPage />} />
  //         <Route path="/products" element={<ProductsPage />} />
  //         <Route path="/products/:slug" element={<ProductDetailPage />} />

  //         <Route path="/category/:slug" element={<CategoryPage />} />
  //         <Route path="/profile" element={<ProfilePage />} />

  //         <Route path="/orders" element={<OrdersPage />} />
  //         <Route path="/cart" element={<CartPage />} />
  //       </Routes>
  //     </Body>
  //     <Footer />
  //   </BrowserRouter>
  // );
}
