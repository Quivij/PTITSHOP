import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDeliveryAddress } from '../../hooks/useDeliveryAddress.ts';
import { CartItem } from '../../types/Cart';
import { Voucher } from '../../api/voucherApi';
import { paymentApi } from '../../api/paymentApi.ts';
import { Button, Tag, Modal, Spin, Radio } from 'antd';
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined, CreditCardOutlined, TruckOutlined } from '@ant-design/icons';

import './CheckoutPage.css';
import AddressFormModal from './AddressFormModal.tsx';
import { CreateAddressPayload, DeliveryAddress } from '../../types/deliveryAddress.ts';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const { items, voucher, xu: usedXu } = (state || {}) as { items: CartItem[], voucher: Voucher | null, xu: number };

    const {
        addresses,
        loading: addressLoading,
        error,
        getDefaultAddress,
        createAddress,
        updateAddress,
        deleteAddress,
    } = useDeliveryAddress();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
    const [paymentResultModal, setPaymentResultModal] = useState({ visible: false, message: '' });
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod'>('bank');

    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!items || items.length === 0) {
            toast.error('Không có sản phẩm để thanh toán. Đang quay về giỏ hàng...');
            setTimeout(() => navigate('/cart'), 2000);
        }
    }, [items, navigate]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = getDefaultAddress();
            if (defaultAddress) setSelectedAddressId(defaultAddress._id);
        }
    }, [addresses, getDefaultAddress, selectedAddressId]);

    // Tính toán lại giá trị đơn hàng
    const { subTotal, voucherDiscount, finalPrice } = useMemo(() => {
        const subTotal = items?.reduce((sum, item) => {
            const priceAfterDiscount = item.product.price * (1 - (item.product.discount || 0) / 100);
            return sum + priceAfterDiscount * item.quantity;
        }, 0) || 0;

        let voucherDiscount = 0;
        if (voucher) {
            if (voucher.type === 'percentage') {
                voucherDiscount = (subTotal * voucher.discountValue) / 100;
            } else {
                voucherDiscount = voucher.discountValue;
            }
        }

        const finalPrice = Math.max(0, subTotal - voucherDiscount - (usedXu || 0));
        return { subTotal, voucherDiscount, finalPrice };
    }, [items, voucher, usedXu]);

    // --- Address CRUD Handlers ---
    const handleOpenModal = (address: DeliveryAddress | null = null) => {
        setEditingAddress(address);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingAddress(null);
    };

    const handleFormSubmit = async (values: CreateAddressPayload) => {
        let result;
        if (editingAddress) {
            result = await updateAddress(editingAddress._id, values);
        } else {
            result = await createAddress(values);
        }

        if (result.success) {
            toast.success(editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!');
            handleCloseModal();
        } else {
            toast.error(result.message || 'Có lỗi xảy ra.');
        }
    };

    const handleDelete = (addressId: string) => {
        setAddressToDelete(addressId); // Lưu ID của địa chỉ cần xóa
        setIsDeleteConfirmVisible(true);
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return; // Nếu không có id thì không làm gì cả

        const result = await deleteAddress(addressToDelete);
        if (result.success) {
            toast.success('Xóa địa chỉ thành công!');
            if (selectedAddressId === addressToDelete) {
                setSelectedAddressId(null);
            }
        } else {
            toast.error(result.message || 'Xóa địa chỉ thất bại.');
        }

        // Đóng modal sau khi xử lý xong
        setIsDeleteConfirmVisible(false);
        setAddressToDelete(null);
    };

    const cancelDelete = () => {
        setIsDeleteConfirmVisible(false);
        setAddressToDelete(null);
    };

    // --- Payment Handler ---
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.warn('Vui lòng chọn địa chỉ giao hàng.');
            return;
        }

        let paymentWindow: Window | null = null;
        if (paymentMethod === 'bank') {
            paymentWindow = window.open('', '_blank');
            if (!paymentWindow) {
                toast.error("Không thể mở tab thanh toán. Vui lòng tắt chặn popup của trình duyệt.");
                return;
            }
        }

        try {
            const payload = {
                items: items.map(item => item.product._id),
                voucherCode: voucher?.code || null,
                usedXu: Number(usedXu) || 0,
                deliveryAddressId: selectedAddressId,
                type: paymentMethod // Thêm type thanh toán
            };
            // Bank - Thanh toán qua ngân hàng
            const res = await paymentApi.createQr(payload);

            if (res.success) {
                if (paymentMethod === 'bank' && res.url) {
                    if (paymentWindow) {
                        paymentWindow.location.href = res.url;
                    }

                    // Lắng nghe kết quả từ tab thanh toán
                    const handleMessage = (event: MessageEvent) => {
                        if (event.origin !== window.location.origin) return;

                        const { status } = event.data;
                        let message = "";
                        switch (status) {
                            case "paid": message = "🎉 Thanh toán thành công!"; break;
                            case "failed": message = "❌ Thanh toán thất bại!"; break;
                            case "invalid": message = "⚠️ Giao dịch không hợp lệ!"; break;
                            case "notfound": message = "🔎 Không tìm thấy đơn hàng!"; break;
                            default: message = "Có lỗi xảy ra trong quá trình thanh toán.";
                        }

                        setPaymentResultModal({ visible: true, message });
                        window.removeEventListener("message", handleMessage);
                    };

                    window.addEventListener("message", handleMessage);
                } else if (paymentMethod === 'cod') {
                    // Trường hợp thanh toán COD
                    setPaymentResultModal({ visible: true, message: "🎉 Đặt hàng thành công! Đơn hàng của bạn sẽ được giao đến địa chỉ đã chọn." });
                }
            } else {
                if (paymentWindow) paymentWindow.close();
                toast.error("Không tạo được link thanh toán");
            }

        } catch (err) {
            if (paymentWindow) paymentWindow.close();
            console.error("Error creating payment:", err);
            toast.error("Có lỗi xảy ra khi tạo thanh toán");
        }
    };

    if (!items || items.length === 0) {
        return <div className="checkout-page-loading"><Spin size="large" /></div>;
    }

    return (
        <div className="checkout-page-wrapper">
            <div className="checkout-page-header">
                <div className="checkout-page-header-content">
                    <h1 className="checkout-page-title">
                        <ShoppingCartOutlined className="checkout-page-title-icon" />
                        Xác nhận đơn hàng
                    </h1>
                    <p className="checkout-page-subtitle">Hoàn tất thông tin để hoàn thành đơn hàng</p>
                </div>
            </div>

            <div className="checkout-page-container">
                <div className="checkout-page-main">
                    <div className="delivery-address-section">
                        <div className="checkout-section-header">
                            <h2 className='checkout-section-title'>
                                <HomeOutlined className="checkout-section-icon" />
                                Địa chỉ nhận hàng
                            </h2>
                            <p className="checkout-section-description">Chọn địa chỉ giao hàng cho đơn hàng của bạn</p>
                        </div>

                        {addressLoading && (
                            <div className="checkout-loading-container">
                                <Spin size="large" />
                                <p>Đang tải địa chỉ...</p>
                            </div>
                        )}

                        {error && (
                            <div className="checkout-error-container">
                                <p className="checkout-error-text">{error}</p>
                            </div>
                        )}

                        <div className="checkout-address-grid">
                            {addresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    className={`checkout-address-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAddressId(addr._id)}
                                >
                                    {addr.defaultAddress && (
                                        <div className="checkout-default-badge">
                                            <Tag color="blue">Mặc định</Tag>
                                        </div>
                                    )}
                                    <div className="checkout-address-card-content">
                                        <div className="checkout-address-card-info">
                                            <h4 className="name">{addr.nameBuyer}</h4>
                                            <p className="phone">
                                                <span className="checkout-info-label">SĐT:</span> {addr.phoneNumber}
                                            </p>
                                            <p className="address">
                                                <span className="checkout-info-label">Địa chỉ:</span> {addr.addressName}
                                            </p>
                                            {addr.note && (
                                                <p className="note">
                                                    <span className="checkout-info-label">Ghi chú:</span> {addr.note}
                                                </p>
                                            )}
                                        </div>
                                        <div className="checkout-address-actions">
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                type="text"
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(addr); }}
                                            />
                                            <Button
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                type="text"
                                                danger
                                                onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="checkout-add-address-card" onClick={() => handleOpenModal()}>
                                <div className="checkout-add-address-content">
                                    <PlusOutlined className="checkout-add-icon" />
                                    <span className="checkout-add-text">Thêm địa chỉ mới</span>
                                    <p className="checkout-add-description">Thêm địa chỉ giao hàng mới</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="payment-method-section">
                        <div className="checkout-section-header">
                            <h2 className='checkout-section-title'>
                                <CreditCardOutlined className="checkout-section-icon" />
                                Phương thức thanh toán
                            </h2>
                            <p className="checkout-section-description">Chọn phương thức thanh toán cho đơn hàng</p>
                        </div>

                        <div className="payment-method-options">
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="payment-radio-group"
                            >
                                <div className="payment-option">
                                    <Radio value="bank" className="payment-radio">
                                        <div className="payment-option-content">
                                            <div className="payment-option-info">
                                                <CreditCardOutlined className="payment-option-icon" />
                                                <div className="payment-option-text">
                                                    <h4>Thanh toán qua ngân hàng</h4>
                                                    <p>Thanh toán trực tuyến qua VNPay</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Radio>
                                </div>
                                <div className="payment-option">
                                    <Radio value="cod" className="payment-radio">
                                        <div className="payment-option-content">
                                            <div className="payment-option-info">
                                                <TruckOutlined className="payment-option-icon" />
                                                <div className="payment-option-text">
                                                    <h4>Thanh toán khi nhận hàng (COD)</h4>
                                                    <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Radio>
                                </div>
                            </Radio.Group>
                        </div>
                    </div>
                </div>

                <div className="checkout-page-sidebar">
                    <div className="order-summary">
                        <div className="checkout-summary-header">
                            <h2 className='checkout-section-title'>
                                <ShoppingCartOutlined className="checkout-section-icon" />
                                Tóm tắt đơn hàng
                            </h2>
                            <p className="checkout-summary-subtitle">{items.length} sản phẩm</p>
                        </div>

                        <div className="checkout-summary-items">
                            {items.map(item => (
                                <div className="checkout-summary-item" key={item.product._id}>
                                    <div className="checkout-summary-item-image">
                                        <img src={item.product.images?.[0]?.url || '/placeholder-image.jpg'} alt={item.product.name} />
                                        {item.product.discount > 0 && (
                                            <div className="checkout-discount-badge">
                                                -{item.product.discount}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="checkout-summary-item-details">
                                        <h4 className='checkout-summary-item-name'>{item.product.name}</h4>
                                        <p className='checkout-summary-item-qty'>Số lượng: {item.quantity}</p>
                                        <div className="checkout-price-info">
                                            <span className="checkout-current-price">
                                                {(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toLocaleString()}đ
                                            </span>
                                            {item.product.discount > 0 && (
                                                <span className="checkout-original-price">
                                                    {(item.product.price * item.quantity).toLocaleString()}đ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-summary-calculations">
                            <div className="checkout-calculation-section">
                                <div className="checkout-summary-line">
                                    <span>Tạm tính</span>
                                    <span>{subTotal.toLocaleString()}đ</span>
                                </div>
                                {voucherDiscount > 0 && (
                                    <div className="checkout-summary-line discount">
                                        <span>
                                            Voucher <Tag color="green" className="checkout-voucher-tag">{voucher?.code}</Tag>
                                        </span>
                                        <span className='checkout-discount-value'>- {voucherDiscount.toLocaleString()}đ</span>
                                    </div>
                                )}
                                {usedXu > 0 && (
                                    <div className="checkout-summary-line discount">
                                        <span>Sử dụng xu</span>
                                        <span className='checkout-discount-value'>- {usedXu.toLocaleString()} xu</span>
                                    </div>
                                )}
                            </div>

                            <div className="checkout-total-section">
                                <div className="checkout-summary-line total">
                                    <span>Tổng cộng</span>
                                    <span className='checkout-total-price'>{finalPrice.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <Button
                                type="primary"
                                danger
                                block
                                size="large"
                                className="checkout-place-order-btn"
                                onClick={handlePlaceOrder}
                                loading={addressLoading}
                                disabled={!selectedAddressId}
                            >
                                {!selectedAddressId
                                    ? 'Vui lòng chọn địa chỉ'
                                    : paymentMethod === 'cod'
                                        ? 'Đặt hàng COD'
                                        : 'Thanh toán ngay'
                                }
                            </Button>
                            {!selectedAddressId && (
                                <p className="checkout-address-warning">Vui lòng chọn địa chỉ giao hàng để tiếp tục</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddressFormModal
                visible={isModalVisible}
                loading={addressLoading}
                initialData={editingAddress}
                onCancel={handleCloseModal}
                onSubmit={handleFormSubmit}
            />

            <Modal
                title="Xác nhận xóa địa chỉ"
                open={isDeleteConfirmVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: addressLoading }}
            >
                <p>Bạn có chắc muốn xóa địa chỉ này? Hành động này không thể hoàn tác.</p>
            </Modal>

            <Modal
                open={paymentResultModal.visible}
                title={paymentResultModal.message.includes("🎉") ? "Thanh toán thành công" : "Thông báo"}
                centered
                closable={false} // Vô hiệu hóa đóng modal
                maskClosable={false} // Ngăn không cho click ra ngoài để đóng

                footer={

                    paymentResultModal.message.includes("🎉")
                        ? [
                            <Button
                                key="continue"
                                onClick={() => {
                                    setPaymentResultModal({ visible: false, message: '' });
                                    navigate('/products');
                                }}
                            >
                                Tiếp tục mua sắm
                            </Button>,
                            <Button
                                key="orders"
                                type="primary"
                                onClick={() => {
                                    setPaymentResultModal({ visible: false, message: '' });
                                    navigate('/orders');
                                }}
                            >
                                Xem đơn hàng
                            </Button>
                        ]
                        // Với các trường hợp khác (thất bại, lỗi...), chỉ cần nút Đóng
                        : [
                            <Button
                                key="close"
                                onClick={() => setPaymentResultModal({ visible: false, message: '' })}
                            >
                                Đóng
                            </Button>
                        ]
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        {paymentResultModal.message.includes("🎉") ? "✅" : "⚠️"}
                    </div>
                    <p style={{ fontSize: '18px', margin: 0 }}>
                        {paymentResultModal.message}
                    </p>
                </div>
            </Modal>
            {/* <ToastContainer position="top-right" autoClose={2000} newestOnTop /> */}
        </div>
    );
};

export default CheckoutPage;