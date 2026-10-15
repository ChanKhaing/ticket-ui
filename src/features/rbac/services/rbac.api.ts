import axiosInstance from '@/lib/axios';

export interface BackendPermission {
  _id: string;
  code: string;
  resource: string;
  action: string;
  description: string;
}

export interface BackendRole {
  _id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: BackendPermission[] | string[];
}

export interface NormalizedRole {
  _id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // code strings e.g. "ticket:read"
  rawPermissions: BackendPermission[];
}

export function normalizeRole(raw: any): NormalizedRole {
  const isAll = raw.permissions?.some((p: any) => (typeof p === 'string' ? p === '*' : p.code === '*'));
  const rawPerms: BackendPermission[] = Array.isArray(raw.permissions)
    ? raw.permissions.filter((p: any) => typeof p === 'object' && p !== null)
    : [];

  const codes: string[] = isAll
    ? ['*']
    : Array.isArray(raw.permissions)
      ? raw.permissions.map((p: any) => (typeof p === 'string' ? p : p.code)).filter(Boolean)
      : [];

  return {
    _id: raw._id || raw.id || '',
    name: raw.name || '',
    description: raw.description || '',
    isSystem: Boolean(raw.isSystem),
    permissions: codes,
    rawPermissions: rawPerms,
  };
}

export const rbacApi = {
  /**
   * Get all system roles with populated permissions
   */
  async getRoles(): Promise<NormalizedRole[]> {
    const res = await axiosInstance.get('/roles');
    const data = res.data?.data ?? res.data;
    if (Array.isArray(data)) {
      return data.map(normalizeRole);
    }
    return [];
  },

  /**
   * Get all permission definitions
   */
  async getPermissions(): Promise<BackendPermission[]> {
    const res = await axiosInstance.get('/permissions');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Create a new role
   */
  async createRole(dto: { name: string; description: string }): Promise<NormalizedRole> {
    const res = await axiosInstance.post('/roles', dto);
    const data = res.data?.data ?? res.data;
    return normalizeRole(data);
  },

  /**
   * Assign permissions to role by permission ObjectIds
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<NormalizedRole> {
    const res = await axiosInstance.post(`/roles/${roleId}/permissions`, { permissionIds });
    const data = res.data?.data ?? res.data;
    return normalizeRole(data);
  },

  /**
   * Delete custom role
   */
  async deleteRole(roleId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/roles/${roleId}`);
    return res.data?.data ?? res.data;
  },
};
