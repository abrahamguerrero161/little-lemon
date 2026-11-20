import { fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Main, { initializeTimes, updateTimes } from './Main';

test('initializeTimes returns non-empty API availability for today', () => {
  jest.useFakeTimers('modern');
  const today = new Date(2026, 10, 20, 12);
  jest.setSystemTime(today);
  const apiTimes = ['17:30', '19:30'];
  window.fetchAPI.mockReturnValue(apiTimes);

  try {
    const result = initializeTimes();

    expect(window.fetchAPI).toHaveBeenCalledTimes(1);
    expect(window.fetchAPI).toHaveBeenCalledWith(today);
    expect(result).toEqual(apiTimes);
    expect(result).not.toHaveLength(0);
  } finally {
    jest.useRealTimers();
  }
});

test.each([
  ['2026-12-12', new Date(2026, 11, 12), ['18:30', '21:00']],
  ['2026-12-13', new Date(2026, 11, 13), ['17:30', '22:00']],
])('updateTimes fetches availability for the dispatched date %s', (selectedDate, expectedDate, apiTimes) => {
  window.fetchAPI.mockReturnValue(apiTimes);
  const previousState = ['17:00'];

  const result = updateTimes(previousState, {
    type: 'dateChanged', date: selectedDate, bookedTimes: [],
  });

  expect(window.fetchAPI).toHaveBeenCalledTimes(1);
  expect(window.fetchAPI).toHaveBeenCalledWith(expectedDate);
  expect(result).toEqual(apiTimes);
  expect(previousState).toEqual(['17:00']);
});

test('clearing the date removes slots without querying the API', () => {
  expect(updateTimes(['17:00'], { type: 'dateChanged', date: '' })).toEqual([]);
  expect(window.fetchAPI).not.toHaveBeenCalled();
});

test('unavailable or failed APIs do not expose unverified slots', () => {
  delete window.fetchAPI;
  expect(initializeTimes()).toEqual([]);
  window.fetchAPI = jest.fn(() => { throw new Error('Unavailable'); });
  expect(initializeTimes()).toEqual([]);
});

test('updateTimes preserves the state for an unrecognized action', () => {
  const state = ['18:00', '20:00'];

  expect(updateTimes(state, { type: 'unknown' })).toBe(state);
});

test('updateTimes excludes booked times for the selected date', () => {
  const result = updateTimes(initializeTimes(), {
    type: 'dateChanged', date: '2026-12-12', bookedTimes: ['17:00', '20:00'],
  });

  expect(result).toEqual(['18:00', '19:00', '21:00', '22:00']);
});

test('updateTimes removes a newly booked time', () => {
  expect(updateTimes(initializeTimes(), { type: 'timeBooked', time: '17:00' }))
    .toEqual(['18:00', '19:00', '20:00', '21:00', '22:00']);
});

test('shares bookings between the form and slot list, independently for each date', () => {
  window.history.replaceState({}, '', '/booking');
  render(<BrowserRouter><Main /></BrowserRouter>);
  const date = screen.getByLabelText('Choose date');
  fireEvent.change(date, { target: { value: '2026-12-12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Make Your reservation' }));
  expect(window.submitAPI).toHaveBeenCalledWith({ date: '2026-12-12', time: '17:00', guests: 1, occasion: 'Birthday' });
  expect(screen.getByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/confirmed-booking');
  fireEvent.click(screen.getByRole('link', { name: 'Make another booking' }));
  const returningDate = screen.getByLabelText('Choose date');
  const returningTime = screen.getByLabelText('Choose time');
  fireEvent.change(returningDate, { target: { value: '2026-12-12' } });
  expect(within(screen.getByRole('list', { name: 'Booking slots' })).getByText('Booked')).toBeInTheDocument();
  expect(Array.from(returningTime.options, option => option.value)).not.toContain('17:00');
  expect(returningTime).toHaveValue('18:00');
  fireEvent.change(returningDate, { target: { value: '2026-12-13' } });
  expect(Array.from(returningTime.options, option => option.value)).toContain('17:00');
  expect(screen.queryByText('Booked')).not.toBeInTheDocument();
  fireEvent.change(returningDate, { target: { value: '2026-12-12' } });
  expect(screen.getByText('Booked')).toBeInTheDocument();
  expect(Array.from(returningTime.options, option => option.value)).not.toContain('17:00');
  window.history.replaceState({}, '', '/');
});


test('changing dates updates the form and slot list from API results', () => {
  window.history.replaceState({}, '', '/booking');
  window.fetchAPI.mockImplementation(date => date.getDate() === 12
    ? ['17:30', '19:00'] : ['18:30', '21:30']);
  render(<BrowserRouter><Main /></BrowserRouter>);
  const date = screen.getByLabelText('Choose date');
  const time = screen.getByLabelText('Choose time');

  fireEvent.change(date, { target: { value: '2026-12-12' } });
  fireEvent.change(time, { target: { value: '19:00' } });
  expect(Array.from(time.options, option => option.value)).toEqual(['17:30', '19:00']);

  fireEvent.change(date, { target: { value: '2026-12-13' } });
  expect(Array.from(time.options, option => option.value)).toEqual(['18:30', '21:30']);
  expect(time).toHaveValue('18:30');
  const slots = screen.getByRole('list', { name: 'Booking slots' });
  expect(within(slots).getByText('18:30')).toBeInTheDocument();
  expect(within(slots).queryByText('19:00')).not.toBeInTheDocument();

  window.fetchAPI.mockReturnValue([]);
  fireEvent.change(date, { target: { value: '2026-12-14' } });
  expect(time).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
  window.history.replaceState({}, '', '/');
});


test.each(['rejected', 'throws', 'unavailable'])('keeps the form open when the submission API is %s', failure => {
  window.history.replaceState({}, '', '/booking');
  if (failure === 'unavailable') delete window.submitAPI;
  else if (failure === 'throws') window.submitAPI.mockImplementation(() => { throw new Error('Unavailable'); });
  else window.submitAPI.mockReturnValue(false);
  render(<BrowserRouter><Main /></BrowserRouter>);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2026-12-12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Make Your reservation' }));
  expect(window.location.pathname).toBe('/booking');
  expect(screen.getByRole('alert')).toHaveTextContent('Please try again');
  expect(screen.getByLabelText('Choose date')).toHaveValue('2026-12-12');
  expect(screen.queryByText('Booked')).not.toBeInTheDocument();
});
