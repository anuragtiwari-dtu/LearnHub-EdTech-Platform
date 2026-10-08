import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const renderHome = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Home Page', () => {
    it('renders the hero section heading', () => {
        renderHome();
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Master Computer Science'
        );
    });

    it('renders the primary CTA button', () => {
        renderHome();
        expect(screen.getByRole('link', { name: /Start Learning Free/i })).toBeInTheDocument();
    });

    it('displays featured courses after loading', async () => {
        renderHome();
        // Wait for the mocked API response to render
        expect(await screen.findByText('Complete React & Next.js Developer')).toBeInTheDocument();
        expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });

    it('renders stats section with mock data', async () => {
        renderHome();
        expect(await screen.findByText('1,500+')).toBeInTheDocument();
        expect(screen.getByText('Active Students')).toBeInTheDocument();
    });

    it('renders the Why Choose Us section', () => {
        renderHome();
        expect(screen.getByRole('heading', { name: /Why Choose LearnHub\?/i })).toBeInTheDocument();
        expect(screen.getByText('Industry-Ready Curriculum')).toBeInTheDocument();
    });
});