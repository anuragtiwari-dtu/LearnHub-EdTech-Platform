import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Login from '@/pages/auth/Login';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const mockSetUser = vi.fn();
vi.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        setUser: mockSetUser,
        isAuthenticated: false,
        user: null,
    }),
}));

const renderLogin = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Login Page', () => {
    it('renders the login form', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument(); // using label association
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows validation errors for invalid inputs', async () => {
        const user = userEvent.setup();
        renderLogin();

        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        await user.click(submitButton);

        // Zod should trigger validation errors
        await waitFor(() => {
            expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it('allows typing into email and password fields', async () => {
        const user = userEvent.setup();
        renderLogin();

        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);

        await user.type(emailInput, 'test@learnhub.com');
        await user.type(passwordInput, 'password123');

        expect(emailInput).toHaveValue('test@learnhub.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('submits form successfully with valid credentials', async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@learnhub.com');
        await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
        await user.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(mockSetUser).toHaveBeenCalled();
        });
    });

    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        renderLogin();

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        const toggleButton = screen.getByRole('button', { name: '' }); // The eye icon button

        expect(passwordInput).toHaveAttribute('type', 'password');
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});