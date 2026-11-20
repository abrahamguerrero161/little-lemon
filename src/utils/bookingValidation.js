export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validateBooking({ date, time, guests, occasion }, availableTimes) {
  const errors = {};
  const [year, month, day] = (date || '').split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || localDateString(parsedDate) !== date) {
    errors.date = 'Choose a valid reservation date.';
  } else if (date < localDateString()) {
    errors.date = 'Choose today or a future date.';
  }
  if (!time || !availableTimes.includes(time)) {
    errors.time = availableTimes.length ? 'Choose an available time.' : 'No times are available. Choose another date.';
  }
  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
    errors.guests = 'Enter a whole number of guests from 1 to 10.';
  }
  if (!['Birthday', 'Anniversary'].includes(occasion)) {
    errors.occasion = 'Choose an occasion.';
  }
  return errors;
}
