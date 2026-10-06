import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedData } from '../data/seed';
import { deriveAll } from '../utils/derive';
import { makeCode, nextId, nextSeq, todayStr } from '../utils/helpers';
import { validateEvent, validateRegistration, validateTicketType } from '../utils/validation';

const KEY = 'event-ticketing-db-v1';
const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.events && parsed.attendees) return parsed;
    }
  } catch (e) {
    /* ignore corrupted storage and fall back to seed data */
  }
  return createSeedData();
}

export function DataProvider({ children }) {
  const [db, setDb] = useState(load);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600); // simulated loading state
    return () => clearTimeout(t);
  }, []);
  // Persist every change so data survives a browser refresh
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      /* storage full or unavailable */
    }
  }, [db]);

  const notify = useCallback((message, severity = 'success') => setToast({ open: true, message, severity }), []);
  const closeToast = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setToast((t) => ({ ...t, open: false }));
  }, []);

  const data = useMemo(() => deriveAll(db), [db]);

  const value = useMemo(() => {
    const fail = (message) => {
      notify(message, 'error');
      return { ok: false, message };
    };
    const patch = (fn) => setDb((p) => ({ ...p, ...fn(p) }));
    const cancelRegs = (p, pred) => {
      const ids = new Set(p.attendees.filter(pred).map((a) => a.id));
      const regIds = new Set(p.attendees.filter((a) => ids.has(a.id)).map((a) => a.registrationId));
      return {
        registrations: p.registrations.map((r) => (regIds.has(r.id) ? { ...r, status: 'Cancelled' } : r)),
        attendees: p.attendees.map((a) => (ids.has(a.id) ? { ...a, attendance: 'Cancelled' } : a)),
        tickets: p.tickets.map((t) =>
          ids.has(t.attendeeId)
            ? { ...t, status: 'Cancelled', paymentStatus: t.paymentStatus === 'Paid' && t.unitPrice > 0 ? 'Refunded' : t.paymentStatus }
            : t
        ),
      };
    };

    // ---------- Categories
    const saveCategory = (c) => {
      const name = c.name.trim();
      if (!name) return { ok: false, errors: { name: 'Category name is required' } };
      if (db.categories.some((x) => x.id !== c.id && x.name.toLowerCase() === name.toLowerCase()))
        return { ok: false, errors: { name: 'A category with this name already exists' } };
      if (c.id) {
        patch((p) => ({ categories: p.categories.map((x) => (x.id === c.id ? { ...x, name, description: c.description.trim() } : x)) }));
        notify('Category updated');
      } else {
        const cat = { id: nextId(db.categories), name, description: c.description.trim(), status: 'Active' };
        patch((p) => ({ categories: [...p.categories, cat] }));
        notify('Category created');
      }
      return { ok: true };
    };
    const deleteCategory = (id) => {
      if (db.events.some((e) => e.categoryId === id)) return fail('This category is used by existing events and cannot be deleted');
      patch((p) => ({ categories: p.categories.filter((c) => c.id !== id) }));
      notify('Category deleted');
      return { ok: true };
    };
    const toggleCategory = (id) => {
      patch((p) => ({ categories: p.categories.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c)) }));
    };

    // ---------- Events
    const saveEvent = (v) => {
      const registered = v.id ? data.events.find((e) => e.id === v.id)?.registered || 0 : 0;
      const errors = validateEvent(v, registered);
      if (Object.keys(errors).length) return { ok: false, errors };
      const clean = {
        ...v,
        categoryId: Number(v.categoryId),
        capacity: Number(v.capacity),
        name: v.name.trim(),
        organizer: v.organizer.trim(),
        venue: v.venue.trim(),
        location: v.location.trim(),
        description: v.description.trim(),
        contact: v.contact.trim(),
      };
      if (v.id) {
        patch((p) => ({ events: p.events.map((e) => (e.id === v.id ? { ...e, ...clean } : e)) }));
        notify('Event updated');
        return { ok: true, event: clean };
      }
      const event = { ...clean, id: nextId(db.events), code: makeCode('EVT', nextSeq(db.events, 'code')), createdAt: todayStr() };
      patch((p) => ({ events: [...p.events, event] }));
      notify(`Event ${event.code} created`);
      return { ok: true, event };
    };
    const deleteEvent = (id) => {
      patch((p) => ({
        events: p.events.filter((e) => e.id !== id),
        ticketTypes: p.ticketTypes.filter((t) => t.eventId !== id),
        registrations: p.registrations.filter((r) => r.eventId !== id),
        attendees: p.attendees.filter((a) => a.eventId !== id),
        tickets: p.tickets.filter((t) => t.eventId !== id),
        attendance: p.attendance.filter((a) => a.eventId !== id),
      }));
      notify('Event and its related records deleted');
    };
    const setEventStatus = (id, status) => {
      setDb((p) => {
        const next = { ...p, events: p.events.map((e) => (e.id === id ? { ...e, status } : e)) };
        return status === 'Cancelled' ? { ...next, ...cancelRegs(p, (a) => a.eventId === id && a.attendance !== 'Cancelled') } : next;
      });
      notify(status === 'Cancelled' ? 'Event cancelled – all active registrations were cancelled' : `Event is now ${status}`);
    };

    // ---------- Ticket types
    const saveTicketType = (v) => {
      const event = data.events.find((e) => e.id === Number(v.eventId));
      const sold = v.id ? data.ticketTypes.find((t) => t.id === v.id)?.sold || 0 : 0;
      const otherTotal = data.ticketTypes
        .filter((t) => t.eventId === Number(v.eventId) && t.id !== v.id)
        .reduce((s, t) => s + t.quantityAvailable, 0);
      const errors = validateTicketType(v, { event, sold, otherTotal });
      if (Object.keys(errors).length) return { ok: false, errors };
      const clean = {
        eventId: Number(v.eventId),
        name: v.name.trim(),
        description: v.description.trim(),
        price: Number(v.price),
        quantityAvailable: Number(v.quantityAvailable),
        salesStart: v.salesStart,
        salesEnd: v.salesEnd,
        status: v.status,
      };
      if (v.id) {
        patch((p) => ({ ticketTypes: p.ticketTypes.map((t) => (t.id === v.id ? { ...t, ...clean } : t)) }));
        notify('Ticket type updated');
      } else {
        patch((p) => ({ ticketTypes: [...p.ticketTypes, { ...clean, id: nextId(db.ticketTypes) }] }));
        notify('Ticket type created');
      }
      return { ok: true };
    };
    const deleteTicketType = (id) => {
      if (db.registrations.some((r) => r.ticketTypeId === id)) return fail('Tickets of this type have been registered – set it to Inactive instead');
      patch((p) => ({ ticketTypes: p.ticketTypes.filter((t) => t.id !== id) }));
      notify('Ticket type deleted');
      return { ok: true };
    };

    // ---------- Registration: Registration -> Ticket Sold -> Available -> Attendee -> Statistics
    const register = (values) => {
      const errors = validateRegistration(values, data);
      if (Object.keys(errors).length) return { ok: false, errors };
      const eventId = Number(values.eventId);
      const ticketTypeId = Number(values.ticketTypeId);
      const quantity = Number(values.quantity);
      const tt = data.ticketTypes.find((t) => t.id === ticketTypeId);
      const attId = nextId(db.attendees);
      const regId = nextId(db.registrations);
      const date = todayStr();
      const registration = { id: regId, regNo: makeCode('REG', nextSeq(db.registrations, 'regNo')), attendeeId: attId, eventId, ticketTypeId, quantity, date, status: 'Confirmed' };
      const attendee = {
        id: attId,
        registrationId: regId,
        eventId,
        ticketTypeId,
        name: values.fullName.trim(),
        gender: values.gender,
        phone: values.phone.trim(),
        email: values.email.trim(),
        organization: values.organization.trim(),
        refNo: values.refNo.trim(),
        attendance: 'Registered',
        checkInAt: null,
      };
      const ticket = {
        id: nextId(db.tickets),
        ticketNo: makeCode('TKT', nextSeq(db.tickets, 'ticketNo')),
        registrationId: regId,
        attendeeId: attId,
        eventId,
        ticketTypeId,
        quantity,
        unitPrice: tt.price,
        date,
        paymentStatus: 'Paid',
        status: 'Confirmed',
      };
      patch((p) => ({ registrations: [...p.registrations, registration], attendees: [...p.attendees, attendee], tickets: [...p.tickets, ticket] }));
      notify(`Registration ${registration.regNo} confirmed – ticket ${ticket.ticketNo} generated`);
      return { ok: true, registration, attendee, ticket };
    };
    const cancelRegistration = (attendeeId) => {
      const a = db.attendees.find((x) => x.id === attendeeId);
      if (!a) return fail('Attendee not found');
      if (a.attendance === 'Cancelled') return fail('This registration is already cancelled');
      if (a.attendance === 'Checked In') return fail('A checked-in attendee cannot be cancelled');
      setDb((p) => ({ ...p, ...cancelRegs(p, (x) => x.id === attendeeId) }));
      notify('Registration cancelled – tickets released');
      return { ok: true };
    };

    // ---------- Attendance: Check In -> Attendance Status -> Statistics -> Dashboard -> Charts
    const checkIn = (attendeeId) => {
      const a = data.attendees.find((x) => x.id === attendeeId);
      if (!a) return fail('Attendee not found');
      if (a.registrationStatus === 'Cancelled') return fail('Cancelled registrations cannot be checked in');
      if (a.attendance === 'Checked In') return fail('This attendee is already checked in');
      const ev = data.events.find((e) => e.id === a.eventId);
      if (!ev || ['Cancelled', 'Draft'].includes(ev.status)) return fail(`Check-in is not available – the event is ${ev ? ev.status : 'missing'}`);
      const now = new Date().toISOString();
      setDb((p) => ({
        ...p,
        attendees: p.attendees.map((x) => (x.id === attendeeId ? { ...x, attendance: 'Checked In', checkInAt: now } : x)),
        tickets: p.tickets.map((t) => (t.attendeeId === attendeeId ? { ...t, status: 'Used' } : t)),
        attendance: [...p.attendance, { id: nextId(p.attendance), attendeeId, eventId: a.eventId, checkedInAt: now }],
      }));
      notify(`${a.name} checked in`);
      return { ok: true };
    };

    return {
      saveCategory, deleteCategory, toggleCategory,
      saveEvent, deleteEvent, setEventStatus,
      saveTicketType, deleteTicketType,
      register, cancelRegistration, checkIn,
      setMode: (mode) => patch((p) => ({ prefs: { ...p.prefs, mode } })),
      resetData: () => {
        setDb(createSeedData());
        notify('Demo data restored');
      },
    };
  }, [db, data, notify]);

  return (
    <Ctx.Provider
      value={{
        ...data,
        ...value,
        prefs: db.prefs || { mode: 'light' },
        registrations: db.registrations,
        attendanceRecords: db.attendance,
        loading,
        notify,
        toast,
        closeToast,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
