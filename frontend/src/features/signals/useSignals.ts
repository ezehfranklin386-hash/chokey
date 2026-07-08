import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalsApi } from '@/shared/api/signals';
import type { SignalFilters } from '@/entities/signals/signals.types';
import { showSuccessToast, showErrorToast } from '@/shared/ui';

/** Fetch signals with optional filters */
export function useSignals(filters?: SignalFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['signals', filters],
    queryFn: () => signalsApi.getSignals(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch single signal detail */
export function useSignal(signalId: string) {
  return useQuery({
    queryKey: ['signal', signalId],
    queryFn: () => signalsApi.getSignal(signalId),
    enabled: !!signalId,
    staleTime: 15_000,
  });
}

/** Fetch signal provider */
export function useSignalProvider(providerId: string | undefined) {
  return useQuery({
    queryKey: ['signal-provider', providerId],
    queryFn: () => signalsApi.getProvider(providerId!),
    enabled: !!providerId,
    staleTime: 60_000,
  });
}

/** Fetch related signals */
export function useRelatedSignals(signalId: string) {
  return useQuery({
    queryKey: ['related-signals', signalId],
    queryFn: () => signalsApi.getRelatedSignals(signalId),
    enabled: !!signalId,
    staleTime: 30_000,
  });
}

/** Toggle bookmark */
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signalId: string) => signalsApi.toggleBookmark(signalId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      queryClient.invalidateQueries({ queryKey: ['signal'] });
      showSuccessToast(result.bookmarked ? 'Signal bookmarked' : 'Bookmark removed');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to update bookmark');
    },
  });
}
