import { useState } from 'react';

export default function BookingForm({ availableTimes, dispatch, submitForm }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  const [submissionError, setSubmissionError] = useState('');

  const selectedTime = availableTimes.includes(time) ? time : (availableTimes[0] || '');

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setDate(nextDate);
    dispatch({ type: 'dateChanged', date: nextDate });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (submitForm({ date, time: selectedTime, guests: Number(guests), occasion })) {
      setSubmissionError('');
    } else {
      setSubmissionError('We could not complete your booking. Please try again.');
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} onChange={() => setSubmissionError('')}>
      <div className="form-field">
        <label htmlFor="res-date">Choose date</label>
        <input type="date" id="res-date" name="date" required value={date} onChange={handleDateChange} />
      </div>
      <div className="form-field">
        <label htmlFor="res-time">Choose time</label>
        <select id="res-time" name="time" required value={selectedTime} disabled={!availableTimes.length} onChange={event => setTime(event.target.value)}>
          {!availableTimes.length && <option value="">No available times</option>}
          {availableTimes.map(availableTime => <option key={availableTime} value={availableTime}>{availableTime}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="guests">Number of guests</label>
        <input type="number" id="guests" name="guests" placeholder="1" min="1" max="10" required value={guests} onChange={event => setGuests(event.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="occasion">Occasion</label>
        <select id="occasion" name="occasion" value={occasion} onChange={event => setOccasion(event.target.value)}>
          <option value="Birthday">Birthday</option>
          <option value="Anniversary">Anniversary</option>
        </select>
      </div>
      <input className="button" type="submit" disabled={!date || !availableTimes.length} value="Make Your reservation" />
      <p className="booking-status" role="alert">
        {submissionError}
      </p>
    </form>
  );
}
