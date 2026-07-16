import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('app');
if (root) createRoot(root).render(<StrictMode><QueryClientProvider client={new QueryClient()}><App /></QueryClientProvider></StrictMode>);
