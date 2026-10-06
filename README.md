# EventHub – Event Management & Ticketing System

**Module:** ITLDF601 – Frontend Development · **Level 6 IT (TVET Certificate VI)** · RP Karongi College

## 1. Project description
A frontend-only web application for managing events, categories, ticket types, attendee registrations, tickets, attendance check-in, statistics and reports. There is **no backend, database or real payment gateway** – everything runs in the browser using React state, mock data and `localStorage`, so data is kept after a refresh.

## 2. Technologies used
React 18 · Vite 5 · JavaScript ES6+ · React Router 6 · Material UI (MUI) 5 · MUI X DataGrid 6 · Recharts · HTML5/CSS3 · Browser `localStorage`

## 3. Installation
Requirements: **Node.js 18 or newer** and npm.

```bash
npm install
```

## 4. How to run
```bash
npm run dev       # development server (http://localhost:5173)
npm run build     # production build in /dist
npm run preview   # preview the production build
```
To restore the original demo data at any time, click the **Reset demo data** icon in the top bar (or clear the site's localStorage).

## 5. Main features
- Dashboard with 9 summary cards, 6 Recharts charts, upcoming / recent / popular / near-capacity lists
- Events CRUD (dialog and full-page forms), search, filter by category / status / date, sorting, table or card view
- Event details at `/events/:eventId` with tabs: Overview, Ticket Types, Attendees, Registrations, Attendance, Statistics
- Category management (create, edit, delete, search, activate/deactivate, event count per category)
- Ticket types per event with automatic remaining-ticket calculation and sales windows
- 3-step registration stepper with full validation and confirmation dialog
- Attendees DataGrid with filters, details page at `/attendees/:attendeeId`, check-in and cancellation
- Ticket list, printable ticket with a mock QR-style visual
- Event statistics page and 9 filterable reports with **Print** and **Export to CSV**
- Light / dark mode (stored in user preferences), responsive drawer layout, loading / empty / error states, snackbars, dialogs

## 6. Page descriptions
| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/events` | Events list (table/cards, search and filters) |
| `/events/new`, `/events/:eventId/edit` | Create / Edit Event page |
| `/events/:eventId` | Event Details |
| `/categories` | Event Categories |
| `/ticket-types` (`?event=ID`) | Ticket Types |
| `/registration` (`?event=ID`) | Registration |
| `/attendees` | Attendees |
| `/attendees/:attendeeId` | Attendee Details |
| `/tickets` | Tickets (view / print) |
| `/statistics` | Event Statistics |
| `/reports` | Reports |

## 7. Registration workflow
`Create Category → Create Event → Create Ticket Types → Publish Event → Register Attendee → Generate Ticket → View Attendee → Check In → Update Attendance → View Statistics → Generate Reports`

When an attendee registers, the app checks: required fields, valid e-mail and phone, valid and open event, valid ticket type, ticket availability, seats left in the event, maximum **10 tickets** per registration, and **duplicate registration** (same e-mail for the same event while still active). On success it creates a registration (`REG-2026-0001`), an attendee record and a ticket (`TKT-2026-0001`), saves to localStorage, and every derived number (sold, remaining, occupancy, revenue, dashboard, charts) updates automatically.

Registration is only possible for events with status **Published, Upcoming or Ongoing**, for **Active** ticket types inside their sales window. Draft, Completed and Cancelled events show a warning and block registration. Cancelling an event cancels and refunds all its active registrations.

## 8. Ticket calculation rules
- `Remaining Tickets = Quantity Available − Quantity Sold` (a ticket type with 0 remaining shows **Sold Out** and cannot be selected)
- Cancelled registrations do **not** count as sold; cancelling releases the tickets
- `Ticket Revenue = Σ (Ticket Price × Quantity Sold)`
- `Occupancy Rate = Registered Attendees ÷ Event Capacity × 100`
- The sum of ticket quantities of an event cannot exceed the event capacity
- "Registered attendees" counts **seats** (a registration of 3 tickets = 3 seats); "Total Attendees" on the dashboard counts registrants

## 9. Attendance calculation
- `Attendance Rate = Checked In Attendees ÷ Registered Attendees × 100`
- Check-in changes the status **Registered / Not Checked In → Checked In**, stores the check-in date/time, marks the ticket **Used** and adds an attendance record
- The same attendee cannot be checked in twice; cancelled registrations and Draft/Cancelled events cannot be checked in; checked-in attendees cannot be cancelled
- Attendance is displayed as percentage, progress bar, chips, cards and charts

## 10. Mock data
Created on first launch (see `src/data/seed.js`): **20 events** across different dates relative to today (completed, ongoing, upcoming, published, draft, cancelled), **10 categories**, **50 ticket types** (Regular, VIP, Student, Early Bird, Corporate, Guest at different prices in RWF), **100 attendees, 100 registrations, 100 tickets**, many checked-in attendees, 11 cancelled registrations, a few sold-out ticket types and events close to capacity. All names, e-mails and phone numbers are fictional.

## 11. localStorage
Everything is stored under the key `event-ticketing-db-v1`: events, categories, ticket types, registrations, attendees, tickets, attendance records and user preferences (light/dark mode).

## 12. Project structure
```
src/
  context/DataContext.jsx   state, localStorage persistence and all actions
  utils/derive.js           derived values (sold, remaining, occupancy, revenue, attendance)
  utils/validation.js       event, ticket type and registration validation
  data/seed.js              mock data generator
  components/               DashboardCard, StatisticsCard, EventCard, EventTable, TicketCard,
                            RegistrationForm, AttendeeTable, StatusChip, ConfirmDialog, ChartCard, charts…
  pages/                    one file per page
```
React concepts demonstrated: functional components, props, `useState`, `useEffect`, `useMemo`, context, controlled forms, validation, conditional rendering, lists and keys, React Router with dynamic routes, derived state, and `map / filter / find / reduce / sort / some`.

## 13. Screenshots
Add your screenshots to the `screenshots/` folder (see `screenshots/README.md` for the suggested file names).

## 14. Future improvements
Real backend and database, authentication and roles, real QR code generation and scanning, online payments, e-mail/SMS ticket delivery, waiting lists, multi-language support, automated tests.
