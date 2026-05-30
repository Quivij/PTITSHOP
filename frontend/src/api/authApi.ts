import axios from 'axios';
import axiosClient from './axiosClient.ts';

const API_URL = 'http://localhost:6969/v1/api';

export const registerUser = async (data: {
  fullName: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  avt?: string;
  email: string;
  username: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// Login
export const loginUser = async (data: { username: string; password: string }) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

// Verify OTP
export const verifyOTP = async (data: { email: string; otp: string }) => {
  const res = await axios.post(`${API_URL}/verify-otp`, data);
  return res.data;
};

// Resend OTP
export const resendOTP = async (data: { email: string }) => {
  const res = await axios.post(`${API_URL}/resend-otp`, data);
  return res.data;
};

// Refresh token
export const refreshToken = async (data: { refreshToken: string }) => {
  const res = await axios.post(`${API_URL}/refresh-token`, data);
  return res.data;
};

// Forgot password
export const forgotPassword = async (data: { email: string; otp: string; newPassword: string }) => {
  const res = await axios.post(`${API_URL}/forgot-password`, data);
  return res.data;
};

// Get user profile (protected)
// export const getUserProfile = async (token: string) => {
//   const res = await axios.get(`${API_URL}/profile`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

// sử dụng axiosClient
export const getUserProfile = async (token: string) => {
  const res = await axiosClient.get(`${API_URL}/profile`);
  return res.data;
};