import { BOOKABLE, MAX_TICKETS } from './constants';
import { fmtDate, isEmail, isPhone, todayStr } from './helpers';

export function validateEvent(v, registered = 0) {
  const e = {};
  ['name', 'organizer', 'venue', 'location', 'description', 'contact'].forEach((k) => {
    if (!String(v[k] || '').trim()) e[k] = 'This field is required';
  });
  if (!v.categoryId) e.categoryId = 'Select a category';
  if (!v.startDate) e.startDate = 'Start date is required';
  if (!v.endDate) e.endDate = 'End date is required';
  if (!v.startTime) e.startTime = 'Start time is required';
  if (!v.endTime) e.endTime = 'End time is required';
  if (v.startDate && v.endDate && v.endDate < v.startDate) e.endDate = 'End date cannot be before the start date';
  if (v.startDate && v.endDate && v.startDate === v.endDate && v.startTime && v.endTime && v.endTime <= v.startTime)
    e.endTime = 'End time must be after the start time';
  const cap = Number(v.capacity);
  if (!Number.isInteger(cap) || cap < 1) e.capacity = 'Capacity must be a whole number of at least 1';
  else if (cap < registered) e.capacity = `Capacity cannot be lower than current registrations (${registered})`;
  return e;
}

export function validateTicketType(v, { event, sold, otherTotal }) {
  const e = {};
  if (!event) e.eventId = 'Select a valid event';
  if (!String(v.name || '').trim()) e.name = 'Ticket name is required';
  if (!String(v.description || '').trim()) e.description = 'Description is required';
  if (v.price === '' || Number(v.price) < 0 || Number.isNaN(Number(v.price))) e.price = 'Price must be 0 or more';
  const q = Number(v.quantityAvailable);
  if (!Number.isInteger(q) || q < 1) e.quantityAvailable = 'Quantity must be a whole number of at least 1';
  else if (q < sold) e.quantityAvailable = `Quantity cannot be lower than tickets already sold (${sold})`;
  else if (event && otherTotal + q > event.capacity)
    e.quantityAvailable = `Event capacity is ${event.capacity}; only ${Math.max(event.capacity - otherTotal, 0)} more tickets can be allocated`;
  if (!v.salesStart) e.salesStart = 'Required';
  if (!v.salesEnd) e.salesEnd = 'Required';
  if (v.salesStart && v.salesEnd && v.salesEnd < v.salesStart) e.salesEnd = 'Sales end cannot be before sales start';
  return e;
}

export function validateRegistration(v, { events, ticketTypes, attendees }) {
  const e = {};
  const ev = events.find((x) => x.id === Number(v.eventId));
  if (!v.eventId || !ev) e.eventId = 'Select a valid event';
  else if (!BOOKABLE.includes(ev.status)) e.eventId = `Registration is closed – this event is ${ev.status}`;

  const tt = ticketTypes.find((x) => x.id === Number(v.ticketTypeId));
  if (!v.ticketTypeId) e.ticketTypeId = 'Select a ticket type';
  else if (!tt || (ev && tt.eventId !== ev.id)) e.ticketTypeId = 'Invalid ticket type for this event';
  else if (tt.status !== 'Active') e.ticketTypeId = 'This ticket type is not on sale';
  else if (tt.remaining <= 0) e.ticketTypeId = 'This ticket type is sold out';
  else if (todayStr() < tt.salesStart || todayStr() > tt.salesEnd)
    e.ticketTypeId = `Sales run from ${fmtDate(tt.salesStart)} to ${fmtDate(tt.salesEnd)}`;

  const qty = Number(v.quantity);
  if (!Number.isInteger(qty) || qty < 1) e.quantity = 'Enter at least 1 ticket';
  else if (qty > MAX_TICKETS) e.quantity = `Maximum ${MAX_TICKETS} tickets per registration`;
  else if (tt && qty > tt.remaining) e.quantity = `Only ${tt.remaining} ticket(s) left for this type`;
  else if (ev && qty > ev.available) e.quantity = `Only ${ev.available} seat(s) left for this event`;

  if (v.fullName.trim().length < 3) e.fullName = 'Full name is required (min. 3 characters)';
  if (!v.gender) e.gender = 'Select a gender';
  if (!v.phone.trim()) e.phone = 'Phone number is required';
  else if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number (9–15 digits)';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  else if (
    ev &&
    attendees.some(
      (a) => a.eventId === ev.id && a.registrationStatus !== 'Cancelled' && a.email.toLowerCase() === v.email.trim().toLowerCase()
    )
  )
    e.email = 'This email is already registered for this event';
  if (!v.refNo.trim()) e.refNo = 'ID / reference number is required';
  return e;
}
