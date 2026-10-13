import type { LoginInput, LoginResult } from '../types';
import type { NormalizedError } from '@/types';

const MOCK_DELAY_MS = 600;

const MOCK_USER = {
  id: 'mock-user-1',
  email: 'admin@example.com',
  fullName: 'Mock Admin',
  role: 'admin' as const,
  status: 'active' as const,
  emailVerified: true,
};

export async function loginMock(input: LoginInput): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

  // Wrong password → simulate 401
  if (input.password !== 'Passw0rd123') {
    const err: NormalizedError = {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email or password is incorrect',
      details: [],
      status: 401,
    };
    throw err;
  }

  // Success
  return {
    user: { ...MOCK_USER, email: input.email },
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    accessExpiresIn: 900,
    refreshExpiresIn: 604800,
  };
}