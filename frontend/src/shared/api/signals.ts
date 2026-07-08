import { apiClient } from '@/shared/api/apiClient';
import type { Signal, SignalProvider, SignalFilters } from '@/entities/signals/signals.types';

export const signalsApi = {
  /** Get signals with filters */
  getSignals: async (filters?: SignalFilters & { page?: number; limit?: number }): Promise<{ signals: Signal[]; total: number; page: number }> => {
    const res = await apiClient.get('/signals', { params: filters });
    return res as unknown as { signals: Signal[]; total: number; page: number };
  },

  /** Get single signal detail */
  getSignal: async (signalId: string): Promise<Signal> => {
    const res = await apiClient.get(`/signals/${signalId}`);
    return res as unknown as Signal;
  },

  /** Get signal provider profile */
  getProvider: async (providerId: string): Promise<SignalProvider> => {
    const res = await apiClient.get(`/signals/providers/${providerId}`);
    return res as unknown as SignalProvider;
  },

  /** Toggle bookmark */
  toggleBookmark: async (signalId: string): Promise<{ bookmarked: boolean }> => {
    const res = await apiClient.post(`/signals/${signalId}/bookmark`);
    return res as unknown as { bookmarked: boolean };
  },

  /** Get related signals (same asset or provider) */
  getRelatedSignals: async (signalId: string): Promise<Signal[]> => {
    const res = await apiClient.get(`/signals/${signalId}/related`);
    return res as unknown as Signal[];
  },
};
