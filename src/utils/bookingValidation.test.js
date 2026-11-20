import { localDateString, validateBooking } from './bookingValidation';

const availableTimes = ['17:00', '18:30'];
const validBooking = { date: '2026-11-20', time: '17:00', guests: 1, occasion: 'Birthday' };

beforeEach(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(2026, 10, 20, 12));
});
afterEach(() => jest.useRealTimers());

test('formats local calendar dates with padded month and day', () => {
  expect(localDateString()).toBe('2026-11-20');
  expect(localDateString(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
});

test.each([
  ['today with the minimum party size', {}],
  ['a future date', { date: '2026-12-12' }],
  ['a leap day', { date: '2028-02-29' }],
  ['the maximum party size', { guests: 10 }],
  ['a numeric input string', { guests: '4' }],
  ['another available time', { time: '18:30' }],
  ['an anniversary', { occasion: 'Anniversary' }],
])('accepts %s', (_description, changes) => {
  expect(validateBooking({ ...validBooking, ...changes }, availableTimes)).toEqual({});
});

test.each([
  ['date', '', 'Choose a valid reservation date.'],
  ['date', 'not-a-date', 'Choose a valid reservation date.'],
  ['date', '2026-02-30', 'Choose a valid reservation date.'],
  ['date', '2027-02-29', 'Choose a valid reservation date.'],
  ['date', '2026-13-01', 'Choose a valid reservation date.'],
  ['date', '2026-11-19', 'Choose today or a future date.'],
  ['time', '', 'Choose an available time.'],
  ['time', '22:00', 'Choose an available time.'],
  ['guests', '', 'Enter a whole number of guests from 1 to 10.'],
  ['guests', 0, 'Enter a whole number of guests from 1 to 10.'],
  ['guests', 11, 'Enter a whole number of guests from 1 to 10.'],
  ['guests', -1, 'Enter a whole number of guests from 1 to 10.'],
  ['guests', 1.5, 'Enter a whole number of guests from 1 to 10.'],
  ['guests', 'abc', 'Enter a whole number of guests from 1 to 10.'],
  ['occasion', '', 'Choose an occasion.'],
  ['occasion', 'Wedding', 'Choose an occasion.'],
])('rejects invalid %s value "%s"', (field, value, message) => {
  expect(validateBooking({ ...validBooking, [field]: value }, availableTimes))
    .toEqual({ [field]: message });
});

test('rejects a time when no slots are available', () => {
  expect(validateBooking(validBooking, []))
    .toEqual({ time: 'No times are available. Choose another date.' });
});

test('reports all invalid fields together', () => {
  const errors = validateBooking({ date: '', time: '', guests: '', occasion: '' }, availableTimes);

  expect(Object.keys(errors).sort()).toEqual(['date', 'guests', 'occasion', 'time']);
});
