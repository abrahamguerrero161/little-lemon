import { fireEvent, render, screen } from '@testing-library/react';
import BookingForm from './BookingForm';
import { initializeTimes } from './Main';

const dispatch = jest.fn();
const submitForm = jest.fn(() => true);
beforeEach(() => {
  jest.clearAllMocks();
  submitForm.mockReturnValue(true);
});

test('renders the Choose date label', () => {
  render(<BookingForm availableTimes={initializeTimes()} dispatch={dispatch} submitForm={submitForm} />);

  expect(screen.getByText('Choose date')).toBeInTheDocument();
});

test('tracks all booking fields and renders available times', () => {
  render(<BookingForm availableTimes={initializeTimes()} dispatch={dispatch} submitForm={submitForm} />);
  const date = screen.getByLabelText('Choose date');
  const time = screen.getByLabelText('Choose time');
  const guests = screen.getByLabelText('Number of guests');
  const occasion = screen.getByLabelText('Occasion');
  expect(Array.from(time.options, option => option.value)).toEqual([
    '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
  ]);
  fireEvent.change(date, { target: { value: '2026-12-12' } });
  fireEvent.change(time, { target: { value: '20:00' } });
  fireEvent.change(guests, { target: { value: '4' } });
  fireEvent.change(occasion, { target: { value: 'Anniversary' } });
  expect(dispatch).toHaveBeenCalledWith({ type: 'dateChanged', date: '2026-12-12' });
  expect(date).toHaveValue('2026-12-12');
  expect(time).toHaveValue('20:00');
  expect(guests).toHaveValue(4);
  expect(occasion).toHaveValue('Anniversary');
  fireEvent.click(screen.getByRole('button', { name: 'Make Your reservation' }));
  expect(submitForm).toHaveBeenCalledWith({ date: '2026-12-12', time: '20:00', guests: 4, occasion: 'Anniversary' });
  expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  fireEvent.change(time, { target: { value: '21:00' } });
  expect(screen.getByRole('alert')).toBeEmptyDOMElement();
});

test('requires a date and restricts party size to 1–10', () => {
  render(<BookingForm availableTimes={initializeTimes()} dispatch={dispatch} submitForm={submitForm} />);
  expect(screen.getByLabelText('Choose date')).toBeInvalid();
  const guests = screen.getByLabelText('Number of guests');
  for (const value of ['0', '11', '']) {
    fireEvent.change(guests, { target: { value } });
    expect(guests).toBeInvalid();
  }
});
