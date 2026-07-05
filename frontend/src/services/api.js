import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Submit Aadhaar details for verification.
 */
export async function submitAadhaar(data) {
  try {
    const res = await api.post('/aadhaar', data);
    return { success: true, data: res.data, message: res.data.message || 'OTP sent successfully' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Aadhaar verification failed',
    };
  }
}

/**
 * Verify the OTP received on the registered mobile.
 */
export async function verifyOtp(data) {
  try {
    const res = await api.post('/otp/verify', data);
    return { success: true, data: res.data, message: res.data.message || 'OTP verified' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'OTP verification failed',
    };
  }
}

/**
 * Submit PAN details for validation.
 */
export async function submitPan(data) {
  try {
    const res = await api.post('/pan', data);
    return { success: true, data: res.data, message: res.data.message || 'PAN verified successfully' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'PAN verification failed',
    };
  }
}
