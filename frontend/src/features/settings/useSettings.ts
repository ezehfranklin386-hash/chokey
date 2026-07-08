import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/shared/api/user';
import { showSuccessToast, showErrorToast } from '@/shared/ui';

/** Fetch user profile */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
    staleTime: 60_000,
  });
}

/** Update profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof userApi.updateProfile>[0]) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showSuccessToast('Profile updated');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to update profile');
    },
  });
}

/** Change password */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => userApi.changePassword(data),
    onSuccess: () => {
      showSuccessToast('Password changed successfully');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to change password');
    },
  });
}

/** Fetch user settings */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: userApi.getSettings,
    staleTime: 60_000,
  });
}

/** Update settings */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => userApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showSuccessToast('Settings saved');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to save settings');
    },
  });
}
