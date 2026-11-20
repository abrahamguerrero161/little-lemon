import BookingSlot from './BookingSlot';

export default function BookingSlotList({ availableTimes, bookedTimes, selectedDate }) {
  const times = [...availableTimes, ...bookedTimes].sort();
  return (
    <section className="booking-slots" aria-labelledby="slots-heading">
      <h2 id="slots-heading">Table times</h2>
      <p>{selectedDate ? `Slots for ${selectedDate}` : 'Choose a date to view its booking slots.'}</p>
      {selectedDate && (
        <ul className="booking-slot-list" aria-label="Booking slots">
          {times.map(time => <BookingSlot key={time} time={time} booked={bookedTimes.includes(time)} />)}
        </ul>
      )}
    </section>
  );
}
