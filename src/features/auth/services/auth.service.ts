import { env } from '@/lib/env';
import { loginApi } from './auth.api';
import { loginMock } from './auth.mock';
import type { LoginInput, LoginResult } from '../types';

export const authService = {
  login: (input: LoginInput): Promise<LoginResult> =>
    env.useMock ? loginMock(input) : loginApi(input),
};