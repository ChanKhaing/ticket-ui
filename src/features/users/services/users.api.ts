import axiosInstance from '@/lib/axios';
import type { User, UserStatus } from '@/types';
import { normalizeUser } from '@/features/auth/services/auth.api';

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId?: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const usersApi = {
  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const res = await axiosInstance.get('/users/me');
    const data = res.data?.data ?? res.data;
    return normalizeUser(data);
  },

  /**
   * Update profile (name, phone, avatar)
   */
  async updateProfile(dto: UpdateProfileInput): Promise<User> {
    const res = await axiosInstance.patch('/users/me', dto);
    const data = res.data?.data ?? res.data;
    return normalizeUser(data);
  },

  /**
   * Change password for logged-in user
   */
  async changePassword(dto: ChangePasswordInput): Promise<{ message: string }> {
    const res = await axiosInstance.post('/users/me/change-password', dto);
    return res.data?.data ?? res.data;
  },

  /**
   * Admin: List users (paginated)
   */
  async getUsers(query?: GetUsersQuery): Promise<PaginatedUsersResponse> {
    const res = await axiosInstance.get('/users', { params: query });
    const payload = res.data;
    const rawUsers = payload?.data ?? [];
    const meta = payload?.meta ?? {
      page: 1,
      limit: rawUsers.length,
      total: rawUsers.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };

    return {
      users: Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : [],
      meta,
    };
  },

  /**
   * Admin: Create a new user
   */
  async createUser(dto: CreateUserInput): Promise<User> {
    const res = await axiosInstance.post('/users', dto);
    const data = res.data?.data ?? res.data;
    return normalizeUser(data);
  },

  /**
   * Admin: Update user status (active, inactive, banned)
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const res = await axiosInstance.patch(`/users/${userId}/status`, { status });
    const data = res.data?.data ?? res.data;
    return normalizeUser(data);
  },

  /**
   * Admin: Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<User> {
    const res = await axiosInstance.patch(`/users/${userId}/role`, { roleId });
    const data = res.data?.data ?? res.data;
    return normalizeUser(data);
  },

  /**
   * Admin: Soft delete user
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/users/${userId}`);
    return res.data?.data ?? res.data;
  },
};
