'use client';

import { ApiProvider } from '@lupa/api-client/provider';

const apiConfig = {
  httpUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  wsUrl: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
  onAuthError: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  },
};

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApiProvider config={apiConfig}>{children}</ApiProvider>;
}
