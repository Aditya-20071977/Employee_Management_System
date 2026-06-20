import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock react-router-dom's Navigate component
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        Navigate: vi.fn(({ to, replace }) => {
            return <div data-testid="navigate" data-to={to} data-replace={replace ? 'true' : 'false'} />;
        }),
    };
});

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should redirect to /login when token is missing', () => {
        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        // Content should not be displayed
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

        // Navigate should be called and rendered
        const navigateElement = screen.getByTestId('navigate');
        expect(navigateElement).toBeInTheDocument();
        expect(navigateElement.getAttribute('data-to')).toBe('/login');
        expect(navigateElement.getAttribute('data-replace')).toBe('true');
    });

    it('should render children when token is present', () => {
        localStorage.setItem('token', 'valid-token-123');

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        // Content should be displayed
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();

        // Navigate should not be rendered
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
});
