import axiosInstance from '@/lib/axios';
import type { LoginInput, LoginResult } from '../types';

export async function loginApi(input: LoginInput): Promise<LoginResult> {
  return axiosInstance.post<never, LoginResult>('/auth/login', input);
}