import { act, fireEvent, render, screen } from '@testing-library/react';
import BookingForm from './BookingForm';
import userEvent from '@testing-library/user-event';
import { initializeTimes } from './Main';

const dispatch = jest.fn();
const submitForm = jest.fn(() => true);
beforeEach(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(2026, 10, 20, 12));
  jest.clearAllMocks();
  submitForm.mockReturnValue(true);
});

afterEach(() => jest.useRealTimers());

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
  act(() => { expect(screen.getByLabelText('Choose date')).toBeInvalid(); });
  const guests = screen.getByLabelText('Number of guests');
  for (const value of ['0', '11', '']) {
    fireEvent.change(guests, { target: { value } });
    act(() => { expect(guests).toBeInvalid(); });
  }
});

test.each(['', '0', '11', '1.5', '-1'])('blocks submission for invalid guest count "%s"', value => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-12-12' } });
  const guests = screen.getByLabelText('Number of guests');
  fireEvent.change(guests, { target: { value } });
  fireEvent.blur(guests);

  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
  expect(guests).toHaveAttribute('aria-invalid', 'true');
  expect(guests).toHaveAccessibleDescription('Enter a whole number of guests from 1 to 10.');
  fireEvent.submit(guests.closest('form'));
  expect(submitForm).not.toHaveBeenCalled();
});

test('rejects past dates and enables submission after invalid fields are corrected', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  const date = screen.getByLabelText('Choose date');
  const button = screen.getByRole('button', { name: 'Make Your reservation' });
  expect(button).toBeDisabled();
  fireEvent.change(date, { target: { value: '2020-01-01' } });
  fireEvent.blur(date);
  act(() => { expect(date).toBeInvalid(); });
  expect(date).toHaveAccessibleDescription('Choose today or a future date.');
  expect(button).toBeDisabled();

  fireEvent.change(date, { target: { value: '2026-12-12' } });
  expect(date).not.toHaveAttribute('aria-invalid');
  expect(button).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '10' } });
  fireEvent.click(button);
  expect(submitForm).toHaveBeenCalledWith({ date: '2026-12-12', time: '17:00', guests: 10, occasion: 'Birthday' });
});

test('disables submission when availability is empty and revalidates when slots change', () => {
  const { rerender } = render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-12-12' } });
  rerender(<BookingForm availableTimes={[]} dispatch={dispatch} submitForm={submitForm} />);
  expect(screen.getByLabelText('Choose time')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
  rerender(<BookingForm availableTimes={['18:00']} dispatch={dispatch} submitForm={submitForm} />);
  expect(screen.getByLabelText('Choose time')).toHaveValue('18:00');
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeEnabled();
});

test.each([
  ['Choose date', { type: 'date', required: '', min: '2026-11-20' }],
  ['Choose time', { required: '' }],
  ['Number of guests', { type: 'number', required: '', min: '1', max: '10', step: '1' }],
  ['Occasion', { required: '' }],
])('applies HTML5 validation attributes to %s', (label, attributes) => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);

  const field = screen.getByLabelText(label);
  for (const [name, value] of Object.entries(attributes)) {
    expect(field).toHaveAttribute(name, value);
  }
});

test.each(['1', '10'])('submits a valid booking for %s guests', guests => {
  render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={dispatch} submitForm={submitForm} />);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-11-20' } });
  fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
  fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: guests } });
  fireEvent.change(screen.getByLabelText('Occasion'), { target: { value: 'Anniversary' } });
  const button = screen.getByRole('button', { name: 'Make Your reservation' });

  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(submitForm).toHaveBeenCalledTimes(1);
  expect(submitForm).toHaveBeenCalledWith({ date: '2026-11-20', time: '18:00', guests: Number(guests), occasion: 'Anniversary' });
});

test('blocks a missing date even when the submit event is triggered directly', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  const date = screen.getByLabelText('Choose date');

  fireEvent.submit(date.closest('form'));

  expect(submitForm).not.toHaveBeenCalled();
  expect(date).toHaveAttribute('aria-invalid', 'true');
  expect(date).toHaveAccessibleDescription('Choose a valid reservation date.');
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
});

test('rejects an empty occasion and clears its error after correction', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-12-12' } });
  const occasion = screen.getByLabelText('Occasion');
  fireEvent.change(occasion, { target: { value: '' } });
  fireEvent.blur(occasion);

  expect(occasion).toHaveAttribute('aria-invalid', 'true');
  expect(occasion).toHaveAccessibleDescription('Choose an occasion.');
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
  fireEvent.submit(occasion.closest('form'));
  expect(submitForm).not.toHaveBeenCalled();

  fireEvent.change(occasion, { target: { value: 'Birthday' } });
  expect(occasion).not.toHaveAttribute('aria-invalid');
  expect(screen.queryByText('Choose an occasion.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeEnabled();
});

test('names the form and field group and preserves the submit button’s visible accessible name', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  expect(screen.getByRole('form', { name: 'Table reservation' }))
    .toHaveAccessibleDescription('All fields are required. Reservations are for 1–10 guests.');
  expect(screen.getByRole('group', { name: 'Reservation details' })).toBeInTheDocument();
  const button = screen.getByRole('button', { name: 'Make Your reservation' });
  expect(button).toHaveAttribute('aria-label', 'On Click');
  expect(button).toHaveAccessibleName('Make Your reservation');
  for (const label of ['Choose date', 'Choose time', 'Number of guests', 'Occasion']) {
    const field = screen.getByLabelText(label);
    expect(field.labels[0]).toHaveAttribute('for', field.id);
  }
});

test('describes empty availability to screen readers', () => {
  render(<BookingForm availableTimes={[]} dispatch={dispatch} submitForm={submitForm} />);
  expect(screen.getByLabelText('Choose time'))
    .toHaveAccessibleDescription('No times are available. Choose another date.');
});


test('supports sequential keyboard access to every form field and submission', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-12-12' } });
  for (const label of ['Choose date', 'Choose time', 'Number of guests', 'Occasion']) {
    userEvent.tab();
    expect(screen.getByLabelText(label)).toHaveFocus();
  }
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toHaveFocus();
});

test('clicking a field label focuses its associated control', () => {
  render(<BookingForm availableTimes={['17:00']} dispatch={dispatch} submitForm={submitForm} />);
  userEvent.click(screen.getByText('Number of guests'));
  expect(screen.getByLabelText('Number of guests')).toHaveFocus();
});
