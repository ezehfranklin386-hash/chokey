import { apiClient } from '@/shared/api/apiClient';
import type { User } from '@/entities/user/user.types';

export const userApi = {
  /** Get current user profile */
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res as unknown as User;
  },

  /** Update profile */
  updateProfile: async (data: Partial<Pick<User, 'fullName' | 'phone' | 'avatarUrl'>>): Promise<User> => {
    const res = await apiClient.put('/auth/profile', data);
    return res as unknown as User;
  },

  /** Change password */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await apiClient.put('/auth/password', data);
    return res as unknown as { message: string };
  },

  /** Get user settings */
  getSettings: async (): Promise<Record<string, any>> => {
    const res = await apiClient.get('/settings');
    return res as unknown as Record<string, any>;
  },

  /** Update user settings */
  updateSettings: async (data: Record<string, any>): Promise<Record<string, any>> => {
    const res = await apiClient.put('/settings', data);
    return res as unknown as Record<string, any>;
  },

  /** Upload avatar */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('avatar', file);
    const res = await apiClient.post('/auth/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res as unknown as { url: string };
  },
};
