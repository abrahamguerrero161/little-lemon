import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ConfirmedBooking({ booking }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <section className="container booking-page" aria-labelledby="confirmation-heading">
      <div className="booking-intro">
        <p className="eyebrow">Little Lemon · Chicago</p>
        <h1 id="confirmation-heading" tabIndex="-1" ref={heading}>Booking confirmed</h1>
        <p>Thank you for booking with Little Lemon. We look forward to welcoming you!</p>
      </div>
      {booking && (
        <div className="booking-panel">
          <h2>Your reservation</h2>
          <dl className="confirmation-details">
            <div><dt>Date</dt><dd>{booking.date}</dd></div>
            <div><dt>Time</dt><dd>{booking.time}</dd></div>
            <div><dt>Guests</dt><dd>{booking.guests}</dd></div>
            <div><dt>Occasion</dt><dd>{booking.occasion}</dd></div>
          </dl>
        </div>
      )}
      <p className="booking-note">This is a demo booking through the course API.</p>
      <Link className="button confirmation-link" to="/booking">Make another booking</Link>
    </section>
  );
}
