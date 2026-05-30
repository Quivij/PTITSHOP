import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CartSummary from "../../components/cart/CartSummary.tsx";
import { CartItem as CartItemType } from "../../types/Cart.ts";
import CartItem from "../../components/cart/CartItem.tsx";
import EmptyCart from "../../components/cart/EmptyCart.tsx";
import { useCart } from "../../hooks/useCart.ts";
// import { paymentApi } from "../../api/paymentApi.ts";
import { voucherApi } from "../../api/voucherApi.ts";
import { toast, ToastContainer } from "react-toastify";
import { Modal, Select, Tag, InputNumber } from "antd";
import "./CartPage.css";


const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, loading, error, updateQuantity, removeItem, clearCart, refetch } = useCart();

  const [modal, setModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  const [userXu, setUserXu] = useState<number>(0);
  const [usedXu, setUsedXu] = useState<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status) {
      let message = "";
      switch (status) {
        case "paid":
          message = "🎉 Thanh toán thành công!";
          // Clear selected items after successful payment
          setSelectedItems([]);
          break;
        case "failed":
          message = "❌ Thanh toán thất bại!";
          break;
        case "invalid":
          message = "⚠️ Giao dịch không hợp lệ!";
          break;
        case "notfound":
          message = "🔎 Không tìm thấy đơn hàng!";
          break;
        default:
          message = "Có lỗi xảy ra trong quá trình thanh toán.";
      }
      setModal({ visible: true, message });
      refetch();

      // Clear URL parameters after showing modal
      navigate("/cart", { replace: true });
    }
  }, [location, navigate, refetch]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await voucherApi.getMyVouchers();
        if (res.success) {
          setVouchers(res.vouchers || []);
          setUserXu(res.xu || 0); // bỏ +1
        }
      } catch (err) {
        console.error("Error fetching vouchers:", err);
      }
    };
    fetchVouchers();
  }, []);

  const handleToggleItem = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleAll = (items: CartItemType[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.product._id));
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    // Kiểm tra xem người dùng có chọn voucher không và voucher đó có yêu cầu giá trị tối thiểu không
    if (selectedVoucher && selectedVoucher.minOrderValue > 0) {
      // So sánh tổng tiền hàng với giá trị tối thiểu của voucher
      if (selectedTotal < selectedVoucher.minOrderValue) {
        toast.error(
          `Tổng tiền hàng phải đạt tối thiểu ${selectedVoucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này.`
        );
        return;
      }
    }

    // Lọc ra các sản phẩm đã chọn để gửi thông tin chi tiết qua state
    const itemsToCheckout = items.filter((item: CartItemType) =>
      selectedItems.includes(item.product._id)
    );

    // Chuyển hướng đến trang /checkout và truyền dữ liệu qua state
    navigate("/checkout", {
      state: {
        items: itemsToCheckout,
        voucher: selectedVoucher,
        xu: usedXu,
      },
    });
    // try {
    //   const res = await paymentApi.createQr({
    //     items: selectedItems,
    //     voucherCode: selectedVoucher?.code || null,
    //     usedXu: Number(usedXu) || 0,
    //   });

    //   if (res.success && res.url) {
    //     const paymentWindow = window.open(res.url, "_blank");

    //     if (!paymentWindow) {
    //       Modal.error({ title: "Lỗi", content: "Không thể mở tab thanh toán. Vui lòng kiểm tra trình duyệt." });
    //       return;
    //     }

    //     // Lắng nghe kết quả từ tab thanh toán
    //     const handleMessage = (event: MessageEvent) => {
    //       if (event.origin !== window.location.origin) return; // bảo mật

    //       const { status, orderId } = event.data;
    //       let message = "";
    //       switch (status) {
    //         case "paid":
    //           message = "🎉 Thanh toán thành công!";
    //           // Clear selected items after successful payment
    //           setSelectedItems([]);
    //           break;
    //         case "failed":
    //           message = "❌ Thanh toán thất bại!";
    //           break;
    //         case "invalid":
    //           message = "⚠️ Giao dịch không hợp lệ!";
    //           break;
    //         case "notfound":
    //           message = "🔎 Không tìm thấy đơn hàng!";
    //           break;
    //         default:
    //           message = "Có lỗi xảy ra trong quá trình thanh toán.";
    //       }
    //       console.log(">> chceckout message:", message);
    //       setModal({ visible: true, message });
    //       refetch();

    //       // Sau khi nhận thông báo xong, bỏ listener
    //       window.removeEventListener("message", handleMessage);
    //     };

    //     window.addEventListener("message", handleMessage);
    //   } else {
    //     Modal.error({ title: "Lỗi", content: "Không tạo được link thanh toán" });
    //   }
    // } catch (err) {
    //   console.error("Error creating QR payment:", err);
    //   Modal.error({ title: "Lỗi", content: "Có lỗi xảy ra khi tạo thanh toán" });
    // }
  };


  const handleContinueShopping = () => {
    navigate("/products");
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      try {
        await clearCart();
      } catch (err) {
        console.error("Error clearing cart:", err);
      }
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (error)
    return (
      <div className="cart-page">
        <p>{error}</p>
        <button onClick={refetch}>Thử lại</button>
      </div>
    );

  const { data } = cart || { data: { items: [], totalItems: 0, totalPrice: 0 } };
  const { items, totalItems } = data;
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;

  const selectedTotal = items
    .filter((i: CartItemType) => selectedItems.includes(i.product._id))
    .reduce((sum, i) => sum + (i.product.price * (1 - (i.product.discount || 0) / 100)) * i.quantity, 0);

  let discount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.type === "percentage") {
      discount = (selectedTotal * selectedVoucher.discountValue) / 100;
    } else if (selectedVoucher.type === "fixed") {
      discount = selectedVoucher.discountValue;
    }
  }

  const finalPrice = Math.max(0, selectedTotal - discount - (usedXu || 0));

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <p>{totalItems > 0 ? `Bạn có ${totalItems} sản phẩm` : "Giỏ hàng trống"}</p>
        </div>

        {totalItems === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="cart-items-header">
                <input
                  type="checkbox" className="custom-checkbox"
                  checked={isAllSelected}
                  onChange={() => handleToggleAll(items)}
                />
                <h2>Sản phẩm</h2>
                <button className="clear-cart-btn" onClick={handleClearCart}>Xóa tất cả</button>
              </div>

              <div className="cart-items-list">
                {items.map((item: CartItemType) => (
                  <CartItem
                    key={item.product._id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeItem}
                    checked={selectedItems.includes(item.product._id)}
                    onToggle={() => handleToggleItem(item.product._id)}
                  />
                ))}
              </div>
            </div>

            <div className="cart-summary-section">
              {/* 📌 Hiển thị số xu */}
              <div style={{ marginBottom: "16px" }}>
                <h3>Số xu của bạn: <b>{userXu.toLocaleString()} xu</b></h3>
                <label>Sử dụng xu: </label>
                <InputNumber
                  min={0}
                  max={userXu}
                  value={usedXu}
                  onChange={(value) => setUsedXu(Number(value) || 0)} // Ép kiểu number
                />
              </div>

              {/* 📌 Chọn voucher */}
              <div style={{ marginBottom: "16px" }}>
                <h3>Chọn Voucher</h3>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn voucher"
                  value={selectedVoucher?.code}
                  onChange={(value) => {
                    const voucher = vouchers.find((v) => v.code === value);
                    setSelectedVoucher(voucher);
                  }}
                >
                  {vouchers.map((v) => (
                    <Select.Option key={v.code} value={v.code}>
                      <Tag color="blue">{v.code}</Tag> -{" "}
                      {v.type === "percentage"
                        ? `${v.discountValue}%`
                        : `${v.discountValue.toLocaleString()}đ`}{" "}
                      (HSD: {new Date(v.expiryDate).toLocaleDateString("vi-VN")})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* 📌 Hiển thị CartSummary */}
              <CartSummary
                totalItems={selectedItems.length}
                totalPrice={finalPrice}
                discount={discount + usedXu} // tổng giảm = voucher + xu
                onCheckout={handleCheckout}
                onContinueShopping={handleContinueShopping}
              />

              {selectedVoucher && (
                <p style={{ marginTop: "8px", fontSize: "14px" }}>
                  Giảm giá voucher: <b>{discount.toLocaleString()}đ ({selectedVoucher.code})</b>
                </p>
              )}
              {usedXu > 0 && (
                <p style={{ marginTop: "4px", fontSize: "14px" }}>
                  Giảm giá xu: <b>{usedXu.toLocaleString()} xu</b>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modal.visible}
        onCancel={() => setModal({ ...modal, visible: false })}
        footer={[
          <button
            key="close"
            onClick={() => setModal({ ...modal, visible: false })}
            className="btn btn-secondary"
            style={{ marginRight: "8px" }}
          >
            Đóng
          </button>,
          modal.message.includes("🎉") && (
            <button
              key="orders"
              onClick={() => {
                setModal({ ...modal, visible: false });
                navigate("/orders");
              }}
              className="btn btn-primary"
            >
              Xem đơn hàng
            </button>
          ),
        ]}
        centered
        closable={false}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {modal.message.includes("🎉") ? "🎉" : modal.message.includes("❌") ? "❌" : modal.message.includes("⚠️") ? "⚠️" : "🔎"}
          </div>
          <p style={{ fontSize: "18px", margin: 0 }}>{modal.message}</p>
        </div>
      </Modal>

      {/* <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      /> */}
    </div>
  );
};

export default CartPage;
