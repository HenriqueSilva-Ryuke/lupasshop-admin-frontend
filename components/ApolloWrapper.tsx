'use client';

import { useMemo } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10, retry: 1, refetchOnWindowFocus: false },
  },
});

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

function createAdminApolloClient() {
  const authLink = setContext((_, { headers }) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const httpLink = new HttpLink({ uri: GRAPHQL_URL });

  const errorLink = onError(({ error }) => {
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('UNAUTHENTICATED')) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
      query: { fetchPolicy: 'network-only' },
    },
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createAdminApolloClient(), []);
  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApolloProvider>
  );
}
