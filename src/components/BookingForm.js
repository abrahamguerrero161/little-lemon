import { useState } from 'react';
import { localDateString, validateBooking } from '../utils/bookingValidation';

export default function BookingForm({ availableTimes, dispatch, submitForm }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  const [touched, setTouched] = useState({});
  const [submissionError, setSubmissionError] = useState('');

  const selectedTime = availableTimes.includes(time) ? time : (availableTimes[0] || '');

  const errors = validateBooking({ date, time: selectedTime, guests, occasion }, availableTimes);
  const isValid = Object.keys(errors).length === 0;

  function fieldProps(field) {
    return {
      'aria-invalid': touched[field] && !!errors[field] ? true : undefined,
      'aria-describedby': [
        touched[field] && errors[field] && (field !== 'time' || availableTimes.length) ? `${field}-error` : '',
        field === 'time' && !availableTimes.length ? 'time-availability' : '',
      ].filter(Boolean).join(' ') || undefined,
      onBlur: () => setTouched(previous => ({ ...previous, [field]: true })),
      onInvalid: () => setTouched(previous => ({ ...previous, [field]: true })),
    };
  }

  function fieldError(field) {
    return touched[field] && errors[field]
      ? <p className="field-error" id={`${field}-error`} aria-live="polite">{errors[field]}</p>
      : null;
  }

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setDate(nextDate);
    dispatch({ type: 'dateChanged', date: nextDate });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || !event.currentTarget.checkValidity()) {
      setTouched({ date: true, time: true, guests: true, occasion: true });
      return;
    }
    if (submitForm({ date, time: selectedTime, guests: Number(guests), occasion })) {
      setSubmissionError('');
    } else {
      setSubmissionError('We could not complete your booking. Please try again.');
    }
  }

  return (
    <form aria-label="Table reservation" aria-describedby="booking-instructions" className="booking-form" onSubmit={handleSubmit} onChange={() => setSubmissionError('')}>
      <p id="booking-instructions">All fields are required. Reservations are for 1–10 guests.</p>
      <fieldset className="booking-fields">
        <legend className="visually-hidden">Reservation details</legend>
      <div className="form-field">
        <label htmlFor="res-date">Choose date</label>
        <input type="date" id="res-date" name="date" min={localDateString()} required {...fieldProps('date')} value={date} onChange={handleDateChange} />
        {fieldError('date')}
      </div>
      <div className="form-field">
        <label htmlFor="res-time">Choose time</label>
        <select id="res-time" name="time" required {...fieldProps('time')} value={selectedTime} disabled={!availableTimes.length} onChange={event => setTime(event.target.value)}>
          {!availableTimes.length && <option value="">No available times</option>}
          {availableTimes.map(availableTime => <option key={availableTime} value={availableTime}>{availableTime}</option>)}
        </select>
        {availableTimes.length > 0 && fieldError('time')}
        <p id="time-availability" className="field-error" aria-live="polite">{!availableTimes.length ? 'No times are available. Choose another date.' : ''}</p>
      </div>
      <div className="form-field">
        <label htmlFor="guests">Number of guests</label>
        <input type="number" id="guests" name="guests" placeholder="1" min="1" max="10" step="1" required {...fieldProps('guests')} value={guests} onChange={event => setGuests(event.target.value)} />
        {fieldError('guests')}
      </div>
      <div className="form-field">
        <label htmlFor="occasion">Occasion</label>
        <select id="occasion" name="occasion" required {...fieldProps('occasion')} value={occasion} onChange={event => setOccasion(event.target.value)}>
          <option value="Birthday">Birthday</option>
          <option value="Anniversary">Anniversary</option>
        </select>
        {fieldError('occasion')}
      </div>
      </fieldset>
      {/* aria-labelledby preserves the visible action as the accessible name. */}
      <button className="button" type="submit" disabled={!isValid} aria-label="On Click" aria-labelledby="booking-submit-label">
        <span id="booking-submit-label">Make Your reservation</span>
      </button>
      <p className="booking-status" role="alert">
        {submissionError}
      </p>
    </form>
  );
}
