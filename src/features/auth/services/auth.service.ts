import { env } from '@/lib/env';
import * as api from './auth.api';
import { loginMock } from './auth.mock';
import type { LoginInput, LoginResult } from '../types';
import type { RegisterInput } from './auth.api';

export const authService = {
  login: (input: LoginInput): Promise<LoginResult> =>
    env.useMock ? loginMock(input) : api.loginApi(input),

  register: (input: RegisterInput): Promise<LoginResult> =>
    api.registerApi(input),

  logout: (refreshToken?: string): Promise<{ message: string }> =>
    api.logoutApi(refreshToken),

  requestOtp: (email: string) =>
    api.requestOtpApi(email),

  verifyOtp: (email: string, code: string) =>
    api.verifyOtpApi(email, code),

  forgotPassword: (email: string) =>
    api.forgotPasswordApi(email),

  verifyResetOtp: (email: string, code: string) =>
    api.verifyResetOtpApi(email, code),

  resetPassword: (token: string, newPassword: string) =>
    api.resetPasswordApi(token, newPassword),

  getMe: () =>
    api.getMeApi(),
};