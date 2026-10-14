import type { AuthUser } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}