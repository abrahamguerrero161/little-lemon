/* global fetchAPI, submitAPI */
import { useReducer, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ConfirmedBooking from './ConfirmedBooking';
import Hero from './Hero';
import Specials from './Specials';
import BookingPage from './BookingPage';

function fetchTimes(date) {
  // If the external library fails to load, do not offer unverified slots.
  if (typeof fetchAPI !== 'function') return [];
  try {
    const times = fetchAPI(date);
    return Array.isArray(times) ? times : [];
  } catch {
    return [];
  }
}

export function initializeTimes() {
  return fetchTimes(new Date());
}


export function updateTimes(state, action) {
  switch (action.type) {
    case 'dateChanged':
      if (!action.date) return [];
      // Parse as local calendar time to avoid shifting the day in UTC offsets.
      const [year, month, day] = action.date.split('-').map(Number);
      return fetchTimes(new Date(year, month - 1, day))
        .filter(time => !(action.bookedTimes || []).includes(time));
    case 'timeBooked':
      return state.filter(time => time !== action.time);
    default:
      return state;
  }
}

export default function Main() {
  const [availableTimes, dispatch] = useReducer(updateTimes, undefined, initializeTimes);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState({});
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const navigate = useNavigate();

  function dispatchDateChange(action) {
    setSelectedDate(action.date);
    dispatch({ ...action, bookedTimes: bookings[action.date] || [] });
  }

  function submitForm(booking) {
    if (!booking.date || booking.date !== selectedDate || !availableTimes.includes(booking.time)) return false;
    try {
      if (typeof submitAPI !== 'function' || submitAPI(booking) !== true) return false;
    } catch {
      return false;
    }
    setBookings(previous => ({
      ...previous,
      [booking.date]: [...(previous[booking.date] || []), booking.time],
    }));
    dispatch({ type: 'timeBooked', date: booking.date, time: booking.time });
    setConfirmedBooking(booking);
    navigate('/confirmed-booking');
    return true;
  }

  return (
    <main id="main-content">
      <Routes>
        <Route path="/" element={<><Hero /><Specials /></>} />
        <Route path="/booking" element={
          <BookingPage availableTimes={availableTimes} dispatch={dispatchDateChange} selectedDate={selectedDate} bookedTimes={bookings[selectedDate] || []} submitForm={submitForm} />
        } />
        <Route path="/confirmed-booking" element={<ConfirmedBooking booking={confirmedBooking} />} />
      </Routes>
    </main>
  );
}
