import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const queryClient = new QueryClient();
const appRoot = document.getElementById('app');
if (appRoot) {
    createRoot(appRoot).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </StrictMode>,
    );
} else {
    console.error('Missing #app div for createRoot.');
}
