import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { cartApi } from '../api/cartApi.ts';
import type { CartResponse } from '../types/Cart';

export const useCart = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    let count = useRef(0);

    const broadcastCartCount = (nextCount: number) => {
        try {
            localStorage.setItem('cart_count', String(nextCount));
        } catch { }
        try {
            window.dispatchEvent(new CustomEvent('cart:updated', { detail: nextCount }));
        } catch { }
    };

    const fetchCart = useCallback(async () => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            if (count.current === 0) {
                count.current += 1;
                setLoading(true);
            }
            setError(null);
            const response = await cartApi.getCart();
            setCart(response);
            //  setCartCount(response.data.totalItems);
            broadcastCartCount(response.data.totalItems);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const updateQuantity = async (productId: string, quantity: number) => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {

            setError(null);
            const response = await cartApi.updateQuantity(productId, quantity);
            console.log('>>> Updated cart response:', response);
            fetchCart();
        } catch (err: any) {
            // setError(err.message || 'Failed to update quantity');
            // throw err;
            if (err.response) {
                // Lỗi từ BE trả về
                alert(err.response.data.message || 'Failed to update quantity');
                //   setError(err.response.data.message || 'Failed to update quantity');
            } else {
                // Lỗi network hoặc lỗi khác
                setError(err.message || 'Failed to update quantity');
            }
        }
    };

    const removeItem = async (productId: string) => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.removeItem(productId);
            fetchCart();
            console.log('>>> Removed item response:', response);
        } catch (err: any) {
            setError(err.message || 'Failed to remove item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.clearCart();
            console.log('>>> Cleared cart response:', response);
            fetchCart();
        } catch (err: any) {
            setError(err.message || 'Failed to clear cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.addToCart(productId, quantity);
            await fetchCart(); 
            setCart(response);
            const nextCount = response?.data?.totalItems ?? 0;
            //   setCartCount(nextCount);
            broadcastCartCount(nextCount);
        } catch (err: any) {
            setError(err.message || 'Failed to add to cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch cart when component mounts and token is available
    useEffect(() => {
        try {
            const stored = localStorage.getItem('cart_count');
            if (stored) {
                const parsed = Number(stored);
                if (!Number.isNaN(parsed)) setCartCount(parsed);
            }
        } catch { }

        // Listen to global cart updates
        const handler = (e: Event) => {
            const custom = e as CustomEvent<number>;
            if (typeof custom.detail === 'number') {
                setCartCount(custom.detail);
            }
        };
        window.addEventListener('cart:updated', handler as EventListener);

        if (token && !cart) {
            fetchCart();
        }

        return () => {
            window.removeEventListener('cart:updated', handler as EventListener);
        };
    }, [token, cart, fetchCart]);

    return {
        cart,
        loading,
        error,
        cartCount,
        fetchCart,
        updateQuantity,
        removeItem,
        clearCart,
        addToCart,
        refetch: fetchCart

    };
};