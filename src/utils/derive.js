import { BOOKABLE, NEAR_CAPACITY } from './constants';
import { monthKey, monthLabel, pct } from './helpers';

// Everything the UI shows (sold, remaining, occupancy, revenue, attendance...) is derived here from
// the raw stored lists, so a single change (e.g. a registration) flows to every page and chart.
export function deriveAll(db) {
  const catMap = new Map(db.categories.map((c) => [c.id, c]));
  const eventBase = new Map(db.events.map((e) => [e.id, e]));
  const regMap = new Map(db.registrations.map((r) => [r.id, r]));
  const ticketByAtt = new Map(db.tickets.map((t) => [t.attendeeId, t]));

  const soldByType = {};
  const seatsByEvent = {};
  db.registrations.forEach((r) => {
    if (r.status === 'Cancelled') return;
    soldByType[r.ticketTypeId] = (soldByType[r.ticketTypeId] || 0) + r.quantity;
    seatsByEvent[r.eventId] = (seatsByEvent[r.eventId] || 0) + r.quantity;
  });

  // Remaining Tickets = Quantity Available - Quantity Sold
  const ticketTypes = db.ticketTypes.map((t) => {
    const sold = soldByType[t.id] || 0;
    const remaining = Math.max(t.quantityAvailable - sold, 0);
    return {
      ...t,
      eventName: eventBase.get(t.eventId)?.name || '—',
      sold,
      remaining,
      revenue: sold * t.price,
      displayStatus: t.status === 'Active' && remaining === 0 ? 'Sold Out' : t.status,
    };
  });
  const typeMap = new Map(ticketTypes.map((t) => [t.id, t]));

  const attendees = db.attendees.map((a) => {
    const r = regMap.get(a.registrationId) || {};
    const t = ticketByAtt.get(a.id) || {};
    const ev = eventBase.get(a.eventId);
    const unitPrice = t.unitPrice ?? typeMap.get(a.ticketTypeId)?.price ?? 0;
    const quantity = r.quantity || 1;
    return {
      ...a,
      regNo: r.regNo,
      quantity,
      registrationDate: r.date,
      registrationStatus: r.status,
      ticketId: t.id,
      ticketNo: t.ticketNo,
      ticketStatus: t.status,
      paymentStatus: t.paymentStatus,
      unitPrice,
      total: unitPrice * quantity,
      eventName: ev?.name || '—',
      categoryId: ev?.categoryId,
      categoryName: catMap.get(ev?.categoryId)?.name || '—',
      ticketTypeName: typeMap.get(a.ticketTypeId)?.name || '—',
    };
  });
  const attMap = new Map(attendees.map((a) => [a.id, a]));

  const tickets = db.tickets.map((t) => {
    const ev = eventBase.get(t.eventId);
    return {
      ...t,
      regNo: regMap.get(t.registrationId)?.regNo,
      attendeeName: attMap.get(t.attendeeId)?.name || '—',
      attendance: attMap.get(t.attendeeId)?.attendance,
      eventName: ev?.name || '—',
      venue: ev?.venue,
      eventDate: ev?.startDate,
      eventEndDate: ev?.endDate,
      organizer: ev?.organizer,
      ticketTypeName: typeMap.get(t.ticketTypeId)?.name || '—',
      total: t.unitPrice * t.quantity,
    };
  });

  const events = db.events.map((e) => {
    const registered = seatsByEvent[e.id] || 0;
    const mine = attendees.filter((a) => a.eventId === e.id);
    const active = mine.filter((a) => a.registrationStatus !== 'Cancelled');
    const checkedIn = active.filter((a) => a.attendance === 'Checked In').reduce((s, a) => s + a.quantity, 0);
    const types = ticketTypes.filter((t) => t.eventId === e.id);
    return {
      ...e,
      categoryName: catMap.get(e.categoryId)?.name || '—',
      registered,
      available: Math.max(e.capacity - registered, 0),
      registrationCount: active.length,
      checkedIn,
      notCheckedIn: registered - checkedIn,
      cancelledCount: mine.length - active.length,
      ticketsSold: types.reduce((s, t) => s + t.sold, 0),
      revenue: types.reduce((s, t) => s + t.revenue, 0), // Sum of ticket price x quantity sold
      occupancy: pct(registered, e.capacity), // Registered / Capacity x 100
      attendanceRate: pct(checkedIn, registered), // Checked In / Registered x 100
    };
  });

  const categories = db.categories.map((c) => ({ ...c, eventCount: db.events.filter((e) => e.categoryId === c.id).length }));

  const activeAtt = attendees.filter((a) => a.registrationStatus !== 'Cancelled');
  const bookableTypes = ticketTypes.filter((t) => t.status === 'Active' && BOOKABLE.includes(eventBase.get(t.eventId)?.status));
  const totals = {
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => ['Upcoming', 'Published'].includes(e.status)).length,
    completedEvents: events.filter((e) => e.status === 'Completed').length,
    totalRegistrations: db.registrations.length,
    totalAttendees: activeAtt.length,
    ticketsSold: events.reduce((s, e) => s + e.ticketsSold, 0),
    availableTickets: bookableTypes.reduce((s, t) => s + t.remaining, 0),
    revenue: events.reduce((s, e) => s + e.revenue, 0),
    cancelled: db.registrations.length - activeAtt.length,
    checkedIn: events.reduce((s, e) => s + e.checkedIn, 0),
  };
  const nearCapacity = events
    .filter((e) => BOOKABLE.includes(e.status) && e.occupancy >= NEAR_CAPACITY)
    .sort((a, b) => b.occupancy - a.occupancy);

  return { categories, events, ticketTypes, attendees, tickets, totals, nearCapacity };
}

export function buildMonthly(attendees) {
  const map = {};
  attendees
    .filter((a) => a.registrationStatus !== 'Cancelled' && a.registrationDate)
    .forEach((a) => {
      const k = monthKey(a.registrationDate);
      map[k] = map[k] || { key: k, registrations: 0, tickets: 0, revenue: 0 };
      map[k].registrations += 1;
      map[k].tickets += a.quantity;
      map[k].revenue += a.total;
    });
  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((m) => ({ ...m, label: monthLabel(m.key) }));
}
