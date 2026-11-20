import BookingForm from './BookingForm';
import BookingSlotList from './BookingSlotList';

export default function BookingPage({ availableTimes, dispatch, selectedDate, bookedTimes, submitForm }) {
  return (
    <section className="container booking-page" aria-labelledby="booking-heading">
      <div className="booking-intro">
        <p className="eyebrow">Little Lemon · Chicago</p>
        <h1 id="booking-heading" tabIndex="-1">Reserve a table</h1>
        <p>Join us for fresh Mediterranean favorites. Choose a date, time, and party size to plan your visit.</p>
      </div>
      <div className="booking-panel">
        <h2>Your visit</h2>
        <BookingForm availableTimes={availableTimes} dispatch={dispatch} submitForm={submitForm} />
      </div>
      <BookingSlotList availableTimes={availableTimes} bookedTimes={bookedTimes} selectedDate={selectedDate} />
      <p className="booking-note">Celebrating something special? Select an occasion so we can help you plan.</p>
    </section>
  );
}
