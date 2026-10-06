import { addDays, makeCode, todayStr } from '../utils/helpers';

// Small deterministic random generator so the demo data looks the same each time it is reset.
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = [
  ['Conference', 'Large gatherings with keynote speakers and panels'],
  ['Workshop', 'Hands-on practical sessions'],
  ['Seminar', 'Focused educational talks and discussions'],
  ['Training', 'Skills development programmes'],
  ['Graduation', 'Academic and vocational graduation ceremonies'],
  ['Sports', 'Tournaments, matches and fitness events'],
  ['Cultural', 'Arts, heritage, dance and literature'],
  ['Business', 'Networking, forums and investor meetings'],
  ['Entertainment', 'Concerts, comedy and live shows'],
  ['Community', 'Local volunteer and neighbourhood activities'],
];

// [name, organizer, venue, location, capacity, start offset in days from today]
const EVENTS = [
  ['Digital Skills Summit', 'RP Karongi College', 'Main Auditorium', 'Karongi', 300, -300],
  ['React Frontend Bootcamp', 'TechHub Rwanda', 'Innovation Lab', 'Kigali', 150, -260],
  ['Public Health Seminar', 'Lakeside Health Institute', 'Hall B', 'Rubavu', 120, -230],
  ['Entrepreneurship Training Week', 'Youth Business Network', 'Training Room 2', 'Huye', 90, -200],
  ['Class of 2026 Graduation', 'RP Karongi College', 'Open Grounds', 'Karongi', 500, -170],
  ['Inter-College Football Cup', 'Western Sports League', 'Karongi Stadium', 'Karongi', 800, -140],
  ['Heritage & Dance Festival', 'Umurage Arts Collective', 'Cultural Village', 'Musanze', 400, -110],
  ['SME Growth Forum', 'Rwanda SME Alliance', 'Skyline Hall', 'Kigali', 150, -80],
  ['Lake Kivu Music Night', 'Kivu Live Events', 'Beach Arena', 'Rubavu', 250, -55],
  ['Community Clean-Up & Fair', 'Karongi District Volunteers', 'Town Square', 'Karongi', 200, -40],
  ['Cybersecurity Awareness Conference', 'SafeNet Africa', 'Grand Hall', 'Kigali', 250, -25],
  ['UI/UX Design Workshop', 'Pixel Studio', 'Design Lab', 'Huye', 100, -12],
  ['Agri-Tech Seminar', 'GreenFields Institute', 'Hall A', 'Musanze', 12, -1],
  ['Leadership Training Retreat', 'Horizon Leadership Centre', 'Retreat Lodge', 'Rusizi', 16, 6],
  ['TVET Graduation – Evening Cohort', 'RP Karongi College', 'Main Auditorium', 'Karongi', 20, 14],
  ['Volleyball Championship', 'Western Sports League', 'Indoor Arena', 'Rubavu', 300, 25],
  ['Storytelling & Poetry Evening', 'Umurage Arts Collective', 'Library Theatre', 'Huye', 80, 40],
  ['Investors Networking Breakfast', 'Rwanda SME Alliance', 'Lakeview Hotel', 'Karongi', 90, 60],
  ['Comedy Gala Night', 'Kivu Live Events', 'City Theatre', 'Kigali', 500, 85],
  ['Neighbourhood Health Walk', 'Karongi District Volunteers', 'Lake Promenade', 'Karongi', 150, 120],
];
const STATUS_OVERRIDE = { 7: 'Cancelled', 17: 'Cancelled', 18: 'Draft', 19: 'Draft', 15: 'Published', 16: 'Published', 13: 'Upcoming', 14: 'Upcoming' };
const BASE_PRICE = [20000, 35000, 5000, 15000, 0, 3000, 8000, 25000, 12000, 0, 30000, 18000, 10000, 40000, 0, 2000, 6000, 45000, 15000, 0];
const TYPE_SETS = {
  3: [['Regular', 1], ['VIP', 2.5], ['Student', 0.5]],
  '3b': [['Regular', 1], ['Corporate', 1.8], ['Guest', 0.8]],
  2: [['Regular', 1], ['Early Bird', 0.7]],
  '2b': [['Regular', 1], ['Student', 0.5]],
};
const FIRST = ['Aline', 'Eric', 'Grace', 'Jean', 'Diane', 'Patrick', 'Claudine', 'Samuel', 'Josiane', 'Emmanuel', 'Belyse', 'Olivier', 'Chantal', 'Fabrice', 'Esperance', 'Kevin', 'Solange', 'Yvan', 'Marie', 'David'];
const LAST = ['Uwase', 'Niyonzima', 'Mukamana', 'Habimana', 'Ingabire', 'Nshimiyimana', 'Uwimana', 'Mugisha', 'Iradukunda', 'Ndayisaba'];
const ORGS = ['RP Karongi College', 'Kivu Tech Ltd', 'Green Valley Co-op', 'Independent', 'Lakeside Clinic', 'Huye Traders', 'Musanze Creatives', 'Rubavu Logistics'];
const NEAR_FULL_IDS = [13, 14, 15];

export function createSeedData() {
  const rand = rng(2026);
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const today = todayStr();

  const categories = CATEGORIES.map(([name, description], i) => ({ id: i + 1, name, description, status: 'Active' }));

  const events = EVENTS.map(([name, organizer, venue, location, capacity, offset], i) => {
    const startDate = addDays(today, offset);
    const endDate = addDays(startDate, i === 12 ? 2 : i % 3 === 0 ? 1 : 0);
    let status = STATUS_OVERRIDE[i];
    if (!status) status = endDate < today ? 'Completed' : startDate <= today ? 'Ongoing' : 'Upcoming';
    if (!STATUS_OVERRIDE[i] && endDate < today) status = 'Completed';
    if (i === 12) status = 'Ongoing';
    const cat = categories[i % 10];
    const slug = organizer.toLowerCase().replace(/[^a-z]+/g, '');
    return {
      id: i + 1,
      code: makeCode('EVT', i + 1),
      name,
      categoryId: cat.id,
      organizer,
      venue,
      location: `${location}, Rwanda`,
      startDate,
      endDate,
      startTime: ['08:00', '09:00', '10:00', '14:00'][i % 4],
      endTime: ['16:00', '17:00', '18:00', '22:00'][i % 4],
      capacity,
      status,
      description: `${name} is a ${cat.name.toLowerCase()} event organised by ${organizer} at ${venue}. Open to students, professionals and community members.`,
      contact: `info@${slug}.example.rw · +25078${String(1000000 + i * 4231).slice(0, 7)}`,
      createdAt: i >= 14 ? addDays(today, -(19 - i) * 3 - ri(0, 2)) : addDays(startDate, -ri(40, 100)),
    };
  });

  // Ticket types: 10 events x 3 + 10 events x 2 = 50
  const ticketTypes = [];
  events.forEach((e, i) => {
    const set = i % 2 === 0 ? (i % 4 === 0 ? TYPE_SETS[3] : TYPE_SETS['3b']) : i % 4 === 1 ? TYPE_SETS[2] : TYPE_SETS['2b'];
    const shares = set.length === 3 ? [0.5, 0.2, 0.3] : [0.7, 0.3];
    let allocated = 0;
    set.forEach(([name, mult], k) => {
      const qty = k === set.length - 1 ? e.capacity - allocated : Math.floor(e.capacity * shares[k]);
      allocated += qty;
      ticketTypes.push({
        id: ticketTypes.length + 1,
        eventId: e.id,
        name,
        description: `${name} admission to ${e.name}`,
        price: Math.round((BASE_PRICE[i] * mult) / 500) * 500,
        quantityAvailable: qty,
        salesStart: addDays(e.startDate, -150),
        salesEnd: e.endDate,
        status: 'Active',
      });
    });
  });

  // Registrations, attendees, tickets, attendance
  const eligible = events.filter((e) => !['Draft', 'Cancelled'].includes(e.status));
  const weights = eligible.map((e) => (NEAR_FULL_IDS.includes(e.id) ? 9 : e.status === 'Completed' ? 2 : 1));
  const totalW = weights.reduce((a, b) => a + b, 0);
  const pickEvent = () => {
    let r = rand() * totalW;
    for (let k = 0; k < eligible.length; k++) {
      r -= weights[k];
      if (r <= 0) return eligible[k];
    }
    return eligible[0];
  };
  const soldType = {};
  const soldEvent = {};
  const registrations = [];
  const attendees = [];
  const tickets = [];
  const attendance = [];

  for (let r = 0; r < 100; r++) {
    const cancelled = r % 9 === 4;
    let ev = null;
    let tt = null;
    let qty = 1;
    for (let tries = 0; tries < 30 && !tt; tries++) {
      const e = pickEvent();
      const types = ticketTypes.filter((t) => t.eventId === e.id);
      const t = types[ri(0, types.length - 1)];
      const want = [1, 1, 1, 1, 1, 1, 2, 2, 3][ri(0, 8)];
      const left = Math.min(t.quantityAvailable - (soldType[t.id] || 0), e.capacity - (soldEvent[e.id] || 0));
      if (left >= 1) {
        ev = e;
        tt = t;
        qty = Math.min(want, left);
      }
    }
    if (!tt) {
      for (const e of eligible) {
        const t = ticketTypes.find((x) => x.eventId === e.id && x.quantityAvailable - (soldType[x.id] || 0) >= 1 && e.capacity - (soldEvent[e.id] || 0) >= 1);
        if (t) { ev = e; tt = t; qty = 1; break; }
      }
    }
    if (!tt) continue;
    if (!cancelled) {
      soldType[tt.id] = (soldType[tt.id] || 0) + qty;
      soldEvent[ev.id] = (soldEvent[ev.id] || 0) + qty;
    }

    let date = addDays(ev.startDate, -ri(1, 40));
    if (date > today) date = addDays(today, -ri(0, 10));
    const id = registrations.length + 1;
    const first = FIRST[r % 20];
    const last = LAST[(r * 3 + Math.floor(r / 20)) % 10];

    let att = 'Registered';
    if (cancelled) att = 'Cancelled';
    else if (ev.status === 'Completed') att = rand() < 0.78 ? 'Checked In' : 'Not Checked In';
    else if (ev.status === 'Ongoing') att = rand() < 0.5 ? 'Checked In' : 'Registered';
    const checkInAt = att === 'Checked In' ? new Date(new Date(`${ev.startDate}T08:00:00`).getTime() + ri(0, 180) * 60000).toISOString() : null;

    registrations.push({ id, regNo: makeCode('REG', id), attendeeId: id, eventId: ev.id, ticketTypeId: tt.id, quantity: qty, date, status: cancelled ? 'Cancelled' : 'Confirmed' });
    attendees.push({
      id,
      registrationId: id,
      eventId: ev.id,
      ticketTypeId: tt.id,
      name: `${first} ${last}`,
      gender: r % 2 === 0 ? 'Female' : 'Male',
      phone: `0788${String(100000 + r * 7919).slice(0, 6)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${r + 1}@example.com`,
      organization: ORGS[r % ORGS.length],
      refNo: `REF-${100000 + r * 13}`,
      attendance: att,
      checkInAt,
    });
    const pending = !cancelled && att !== 'Checked In' && rand() < 0.1;
    tickets.push({
      id,
      ticketNo: makeCode('TKT', id),
      registrationId: id,
      attendeeId: id,
      eventId: ev.id,
      ticketTypeId: tt.id,
      quantity: qty,
      unitPrice: tt.price,
      date,
      paymentStatus: cancelled ? (tt.price > 0 ? 'Refunded' : 'Paid') : pending ? 'Pending' : 'Paid',
      status: cancelled ? 'Cancelled' : att === 'Checked In' ? 'Used' : pending ? 'Reserved' : 'Confirmed',
    });
    if (att === 'Checked In') attendance.push({ id: attendance.length + 1, attendeeId: id, eventId: ev.id, checkedInAt: checkInAt });
  }

  return { categories, events, ticketTypes, registrations, attendees, tickets, attendance, prefs: { mode: 'light' } };
}
