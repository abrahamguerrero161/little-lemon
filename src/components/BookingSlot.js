export default function BookingSlot({ time, booked }) {
  return (
    <li className={`booking-slot${booked ? ' booking-slot-booked' : ''}`}>
      <span>{time}</span><span>{booked ? 'Booked' : 'Available'}</span>
    </li>
  );
}
