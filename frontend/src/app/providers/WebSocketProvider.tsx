import { type PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

// Zustand store for WebSocket state
interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempt: number;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempt: 0,

  connect: (token) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

    // In demo mode, mark as connected without opening a real socket
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      set({ isConnected: true, reconnectAttempt: 0 });
      return;
    }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => set({ isConnected: true, reconnectAttempt: 0 }));
    socket.on('disconnect', () => set({ isConnected: false }));
    socket.on('connect_error', () => {
      set((state) => ({ reconnectAttempt: state.reconnectAttempt + 1 }));
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    socket?.disconnect();
    set({ socket: null, isConnected: false, reconnectAttempt: 0 });
  },
}));

// Context to wire up lifecycle with auth
interface WebSocketContextValue {
  subscribe: (channel: string, callback: (data: unknown) => void) => () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: PropsWithChildren) {
  const { socket, isConnected } = useWebSocketStore();

  const value = useMemo<WebSocketContextValue>(
    () => ({
      isConnected,
      subscribe: (channel, callback) => {
        socket?.emit('subscribe', channel);
        socket?.on(channel, callback);
        return () => {
          socket?.emit('unsubscribe', channel);
          socket?.off(channel, callback);
        };
      },
    }),
    [socket, isConnected],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}
