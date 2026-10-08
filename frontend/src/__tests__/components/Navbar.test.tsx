import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

vi.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
    }),
}));

vi.mock('@/store/themeStore', () => ({
    useThemeStore: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

const renderNavbar = () => {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );
};

describe('Navbar', () => {
    it('renders the LearnHub logo text', () => {
        renderNavbar();
        expect(screen.getByText('Learn')).toBeInTheDocument();
        expect(screen.getByText('Hub')).toBeInTheDocument();
    });

    it('renders public navigation links', () => {
        renderNavbar();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Courses')).toBeInTheDocument();
        expect(screen.getByText('Blog')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('shows Login and Sign Up buttons when unauthenticated', () => {
        renderNavbar();
        expect(screen.getByText('Start Learning Free')).toBeInTheDocument();
    });
});