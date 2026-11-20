import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Little Lemon page layout', () => {
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: 'Little Lemon' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'This weeks specials!' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reservations' })).toHaveAttribute('href', '/booking');
});

test('opens the booking page at the reservation route', () => {
  window.history.replaceState({}, '', '/booking');
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: 'Reserve a table' })).toBeInTheDocument();
  expect(screen.getByLabelText('Choose date')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'This weeks specials!' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#about');
  window.history.replaceState({}, '', '/');
});
