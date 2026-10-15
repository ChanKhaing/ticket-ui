import axiosInstance from '@/lib/axios';
import type { User } from '@/types';
import type { LoginInput, LoginResult } from '../types';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export function normalizeUser(raw: any): User {
  if (!raw) return raw;
  const roleName = typeof raw.role === 'string'
    ? raw.role
    : (raw.role?.name || 'customer');

  return {
    ...raw,
    _id: raw._id || raw.id || '',
    fullName: raw.fullName || raw.name || '',
    email: raw.email || '',
    role: typeof raw.role === 'object' && raw.role?.name
      ? raw.role
      : {
          _id: raw.role?._id || 'role-' + roleName,
          name: roleName,
          permissions: raw.role?.permissions || (roleName === 'admin' ? ['*'] : []),
        },
    status: raw.status || 'active',
    emailVerified: Boolean(raw.emailVerified),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function loginApi(input: LoginInput): Promise<LoginResult> {
  const res = await axiosInstance.post('/auth/login', input);
  const data = res.data?.data ?? res.data;
  return {
    ...data,
    user: normalizeUser(data.user),
  };
}

export async function registerApi(input: RegisterInput): Promise<LoginResult> {
  const res = await axiosInstance.post('/auth/register', input);
  const data = res.data?.data ?? res.data;
  return {
    ...data,
    user: normalizeUser(data.user),
  };
}

export async function refreshApi(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await axiosInstance.post('/auth/refresh', { refreshToken });
  return res.data?.data ?? res.data;
}

export async function logoutApi(refreshToken?: string): Promise<{ message: string }> {
  try {
    const res = await axiosInstance.post('/auth/logout', { refreshToken });
    return res.data?.data ?? res.data;
  } catch {
    return { message: 'Logged out' };
  }
}

export async function requestOtpApi(email: string): Promise<{ message: string; expiresIn: number }> {
  const res = await axiosInstance.post('/auth/otp/request', { email });
  return res.data?.data ?? res.data;
}

export async function verifyOtpApi(email: string, code: string): Promise<{ message: string; verified: boolean }> {
  const res = await axiosInstance.post('/auth/otp/verify', { email, code });
  return res.data?.data ?? res.data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string; expiresIn: number }> {
  const res = await axiosInstance.post('/auth/forgot', { email });
  return res.data?.data ?? res.data;
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await axiosInstance.post('/auth/reset', { token, newPassword });
  return res.data?.data ?? res.data;
}

export async function getMeApi(): Promise<User> {
  const res = await axiosInstance.get('/users/me');
  const data = res.data?.data ?? res.data;
  return normalizeUser(data);
}