import { useState, useEffect, useCallback } from 'react';
import { deliveryAddressApi } from '../api/deliveryAddressApi.ts';
import { DeliveryAddress, CreateAddressPayload, UpdateAddressPayload } from '../types/deliveryAddress.ts';

export const useDeliveryAddress = () => {
    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await deliveryAddressApi.getAll();
            if (response.success) {
                setAddresses(response.data);
            } else {
                setError(response.message || 'Failed to fetch addresses');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    }, []);

    const createAddress = async (payload: CreateAddressPayload) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deliveryAddressApi.create(payload);
            if (response.success) {
                await fetchAddresses();
                return { success: true, data: response.data };
            } else {
                setError(response.message || 'Failed to create address');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create address';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateAddress = async (id: string, payload: UpdateAddressPayload) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deliveryAddressApi.update(id, payload);
            if (response.success) {
                await fetchAddresses();
                return { success: true, data: response.data };
            } else {
                setError(response.message || 'Failed to update address');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update address';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const deleteAddress = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deliveryAddressApi.delete(id);
            if (response.success) {
                await fetchAddresses();
                return { success: true };
            } else {
                setError(response.message || 'Failed to delete address');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete address';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const setDefaultAddress = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deliveryAddressApi.setDefault(id);
            if (response.success) {
                await fetchAddresses();
                return { success: true, data: response.data };
            } else {
                setError(response.message || 'Failed to set default address');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to set default address';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getDefaultAddress = useCallback(() => {
        return addresses.find(addr => addr.defaultAddress) || addresses[0] || null;
    }, [addresses]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    return {
        addresses,
        loading,
        error,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
        refetch: fetchAddresses
    };
};
