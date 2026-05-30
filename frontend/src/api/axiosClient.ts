// src/api/axiosClient.ts
import axios from "axios";

const API_URL = 'http://localhost:6969/v1/api';

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Function to get token from localStorage or Redux store
const getToken = () => {
    // Try localStorage first
    let token = localStorage.getItem("access_token");

    // If not found, try Redux store
    if (!token) {
        try {
            const state = JSON.parse(localStorage.getItem('persist:root') || '{}');
            if (state.auth) {
                const authState = JSON.parse(state.auth);
                token = authState.token;
            }
        } catch (error) {
            console.warn('Error parsing Redux state:', error);
        }
    }

    return token;
};

// Add request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        // Xử lý refresh token hoặc lỗi chung ở đây
        return Promise.reject(error);
    }
);

export default axiosClient;
