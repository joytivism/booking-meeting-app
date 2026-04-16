import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingPage from './page';

vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('next/image', () => ({ __esModule: true, default: (props: any) => <img {...props} alt={props.alt || 'mocked-image'} /> }));
vi.mock('@/app/actions/booking', () => ({
  getBookedSlots: vi.fn(async () => []),
  submitBooking: vi.fn(async () => ({ success: true })),
}));

describe('BookingPage', () => {
  it('renders without crashing', () => {
    render(<BookingPage />);
    expect(screen.getByText(/Jadwalkan meeting/i)).toBeInTheDocument();
  });
});
