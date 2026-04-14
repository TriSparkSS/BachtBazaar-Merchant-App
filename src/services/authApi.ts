import { apiRequest } from './apiClient';

export type Merchant = {
  _id: string;
  phone: string;
  isVerified: boolean;
  name?: string;
  gender?: string;
  city?: string;
  email?: string;
  profileImage?: string;
  kycStatus?: string;
};

export type AuthResponse = {
  success: boolean;
  token: string;
  merchant: Merchant;
};

const normalizePhoneForApi = (phone: string) => phone.replace(/\D/g, '').slice(-10);

export const sendOtpRequest = (phone: string) =>
  apiRequest<{ success: boolean; exists: boolean }>('/register/send-otp', {
    method: 'POST',
    body: { phone: normalizePhoneForApi(phone) },
  });

export const requestLoginOtp = (phone: string) =>
  apiRequest<{ success: boolean; exists: boolean }>('/send-otp', {
    method: 'POST',
    body: { phone: normalizePhoneForApi(phone) },
  });

export const verifySignupOtpRequest = (token: string) =>
  apiRequest<AuthResponse>('/register/verify-otp', {
    method: 'POST',
    body: { token },
  });

export const loginOtpRequest = (token: string) =>
  apiRequest<AuthResponse>('/login-otp', {
    method: 'POST',
    body: { token },
  });

export const setPasswordRequest = (merchantId: string, password: string) =>
  apiRequest<{ success: boolean }>('/set-password', {
    method: 'POST',
    body: { merchantId, password },
  });

export const loginWithPasswordRequest = (phone: string, password: string) =>
  apiRequest<AuthResponse>('/login-password', {
    method: 'POST',
    body: { phone: normalizePhoneForApi(phone), password },
  });
