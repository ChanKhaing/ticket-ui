// ─── API Response shape ───
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ─── User ───
export type UserRole = 'admin' | 'customer' | 'agent';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ───
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}