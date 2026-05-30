import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Button } from 'antd';
import { DeliveryAddress, CreateAddressPayload } from '../../types/deliveryAddress';

interface AddressFormModalProps {
    visible: boolean;
    loading: boolean;
    initialData: DeliveryAddress | null;
    onCancel: () => void;
    onSubmit: (values: CreateAddressPayload) => void;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({ visible, loading, initialData, onCancel, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialData) {
                form.setFieldsValue(initialData);
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialData, form]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSubmit(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const modalTitle = initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới';

    return (
        <Modal
            open={visible}
            title={modalTitle}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" danger loading={loading} onClick={handleOk}>
                    {initialData ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" name="address_form">
                <Form.Item
                    name="nameBuyer"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="addressName"
                    label="Địa chỉ chi tiết"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <Input />
                </Form.Item>
                <Form.Item name="defaultAddress" valuePropName="checked">
                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddressFormModal;