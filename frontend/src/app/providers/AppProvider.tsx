import { type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './queryClient';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from './I18nProvider';
import { WebSocketProvider } from './WebSocketProvider';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <ThemeProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </ThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
