import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin } from 'antd';

const PaymentCallbackPage = () => {
    const location = useLocation();

    useEffect(() => {
        // Lấy các tham số từ URL (ví dụ: ?status=paid)
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const orderId = params.get('vnp_TxnRef'); // Lấy thêm orderId nếu cần

        // Kiểm tra xem trang này có được mở bởi một trang khác không (window.opener)
        if (window.opener) {
            // Gửi thông điệp chứa kết quả về cho trang gốc
            window.opener.postMessage({
                status: status,
                orderId: orderId
            },
                '*' // Gửi tới bất kỳ origin nào, hoặc chỉ định origin của bạn để bảo mật hơn, ví dụ: 'http://localhost:3000'
            );

            // Đóng tab/cửa sổ này lại
            window.close();
        }
    }, [location]);

    // Hiển thị một spinner trong lúc xử lý để người dùng không thấy trang trắng
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Đang xử lý thanh toán..." />
        </div>
    );
};

export default PaymentCallbackPage;