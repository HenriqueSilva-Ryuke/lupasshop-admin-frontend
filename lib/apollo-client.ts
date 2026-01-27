'use client';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const createApolloClient = () => {
    return new ApolloClient({
        link: new HttpLink({
            uri: 'http://localhost:3000/graphql', // Connect to existing backend
            // In production, this should be an env var
        }),
        cache: new InMemoryCache(),
    });
};

export const client = createApolloClient();
