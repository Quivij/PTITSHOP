import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import type { User } from '../types/User';
import { profileApi } from '../api/profileApi.ts';
import { updateUser } from '../redux/authSlice.ts';

export const useProfile = () => {
    const dispatch = useDispatch();
    const { user: authUser, token } = useSelector((state: RootState) => state.auth);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await profileApi.getProfile();
            setUser(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch profile');
            if (authUser) {
                setUser(authUser);
            }
        } finally {
            setLoading(false);
        }
    }, [token, authUser]);

    const updateProfile = async (data: Partial<User>) => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await profileApi.updateProfile(data);

            // Update local state
            setUser(response.data);

            // Update Redux store để navbar cũng cập nhật
            dispatch(updateUser(response.data));

            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await profileApi.uploadAvatar(file);
            // Update user avatar in state
            if (user) {
                const updatedUser = {
                    ...user,
                    avt: response.data.avatarUrl
                };
                setUser(updatedUser);
                // Update Redux store để navbar cũng cập nhật avatar
                dispatch(updateUser(updatedUser));
            }
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to upload avatar');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch profile when component mounts and token is available
    useEffect(() => {
        if (token && !user) {
            fetchProfile();
        }
    }, [token, user, fetchProfile]);

    return {
        user,
        loading,
        error,
        fetchProfile,
        updateProfile,
        uploadAvatar,
        refetch: fetchProfile
    };
};
