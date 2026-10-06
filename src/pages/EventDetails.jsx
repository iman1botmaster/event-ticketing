import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PublishIcon from '@mui/icons-material/Publish';
import BlockIcon from '@mui/icons-material/Block';
import GroupsIcon from '@mui/icons-material/Groups';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import StatisticsCard from '../components/StatisticsCard';
import AttendeeTable from '../components/AttendeeTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { MonthlyTrendChart, TicketTypeSalesChart } from '../components/charts';
import { useData } from '../context/DataContext';
import { BOOKABLE } from '../utils/constants';
import { fmtDate, fmtDateTime, fmtMoney, fmtPrice } from '../utils/helpers';

const TABS = ['Overview', 'Ticket Types', 'Attendees', 'Registrations', 'Attendance', 'Statistics'];

function Detail({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Grid>
  );
}

export default function EventDetails() {
  const { eventId } = useParams();
  const { events, ticketTypes, attendees, registrations, setEventStatus } = useData();
  const [tab, setTab] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);

  const event = events.find((e) => e.id === Number(eventId));
  const types = useMemo(() => ticketTypes.filter((t) => t.eventId === Number(eventId)), [ticketTypes, eventId]);
  const atts = useMemo(() => attendees.filter((a) => a.eventId === Number(eventId)), [attendees, eventId]);
  const regs = useMemo(() => {
    const byId = new Map(attendees.map((a) => [a.id, a]));
    return registrations.filter((r) => r.eventId === Number(eventId)).map((r) => ({ ...r, attendee: byId.get(r.attendeeId), type: ticketTypes.find((t) => t.id === r.ticketTypeId) }));
  }, [registrations, attendees, ticketTypes, eventId]);

  if (!event) return <Alert severity="error" action={<Button component={Link} to="/events">Back</Button>}>Event not found.</Alert>;

  const bookable = BOOKABLE.includes(event.status);
  const checkedIn = atts.filter((a) => a.attendance === 'Checked In');

  return (
    <>
      <PageHeader
        title={event.name}
        subtitle={`${event.code} · ${event.categoryName} · ${event.organizer}`}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon />} component={Link} to="/events">Back</Button>
            <Button startIcon={<EditIcon />} component={Link} to={`/events/${event.id}/edit`}>Edit</Button>
            {event.status === 'Draft' && <Button variant="outlined" startIcon={<PublishIcon />} onClick={() => setEventStatus(event.id, 'Published')}>Publish</Button>}
            <Button variant="contained" startIcon={<HowToRegIcon />} component={Link} to={`/registration?event=${event.id}`} disabled={!bookable || event.available === 0}>Register Attendee</Button>
            <Button startIcon={<GroupsIcon />} onClick={() => setTab(2)}>View Attendees</Button>
            <Button startIcon={<ConfirmationNumberIcon />} component={Link} to={`/ticket-types?event=${event.id}`}>Manage Tickets</Button>
            {!['Cancelled', 'Completed'].includes(event.status) && <Button color="error" startIcon={<BlockIcon />} onClick={() => setCancelOpen(true)}>Cancel Event</Button>}
          </>
        }
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}><StatusChip status={event.status} size="medium" /><Chip label={event.categoryName} variant="outlined" /></Stack>
      {event.status === 'Cancelled' && <Alert severity="error" sx={{ mb: 2 }}>This event has been cancelled. Registration and check-in are disabled.</Alert>}
      {event.status === 'Draft' && <Alert severity="info" sx={{ mb: 2 }}>This event is a draft. Publish it to open registration.</Alert>}
      {bookable && event.available === 0 && <Alert severity="warning" sx={{ mb: 2 }}>This event is fully booked.</Alert>}

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">{TABS.map((t) => <Tab key={t} label={t} />)}</Tabs>
      </Card>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Detail label="Organizer" value={event.organizer} />
              <Detail label="Venue" value={event.venue} />
              <Detail label="Location" value={event.location} />
              <Detail label="Date" value={`${fmtDate(event.startDate)} – ${fmtDate(event.endDate)}`} />
              <Detail label="Time" value={`${event.startTime} – ${event.endTime}`} />
              <Detail label="Contact" value={event.contact} />
              <Detail label="Capacity" value={event.capacity} />
              <Detail label="Registered attendees" value={event.registered} />
              <Detail label="Available seats" value={event.available} />
              <Grid item xs={12}>
                <Typography variant="caption">Occupancy {event.occupancy}%</Typography>
                <LinearProgress variant="determinate" value={Math.min(event.occupancy, 100)} color={event.occupancy >= 80 ? 'warning' : 'primary'} sx={{ height: 8, borderRadius: 4 }} />
              </Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body2">{event.description}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Ticket</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Available</TableCell><TableCell align="right">Sold</TableCell><TableCell align="right">Remaining</TableCell><TableCell>Sales window</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {types.length === 0 && <TableRow><TableCell colSpan={7}>No ticket types yet – use “Manage Tickets” to add some.</TableCell></TableRow>}
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell><TableCell align="right">{fmtPrice(t.price)}</TableCell>
                    <TableCell align="right">{t.quantityAvailable}</TableCell><TableCell align="right">{t.sold}</TableCell><TableCell align="right">{t.remaining}</TableCell>
                    <TableCell>{fmtDate(t.salesStart)} – {fmtDate(t.salesEnd)}</TableCell><TableCell><StatusChip status={t.displayStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tab === 2 && (atts.length === 0 ? <Alert severity="info">No attendees yet.</Alert> : <Box sx={{ width: '100%' }}><AttendeeTable rows={atts} hideEvent /></Box>)}

      {tab === 3 && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Reg. No.</TableCell><TableCell>Attendee</TableCell><TableCell>Ticket type</TableCell><TableCell align="right">Qty</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {regs.length === 0 && <TableRow><TableCell colSpan={6}>No registrations yet.</TableCell></TableRow>}
                {regs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.regNo}</TableCell><TableCell>{r.attendee?.name}</TableCell><TableCell>{r.type?.name}</TableCell>
                    <TableCell align="right">{r.quantity}</TableCell><TableCell>{fmtDate(r.date)}</TableCell><TableCell><StatusChip status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tab === 4 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><StatisticsCard label="Attendance rate" value={`${event.attendanceRate}%`} percent={event.attendanceRate} color="success" helper={`${event.checkedIn} of ${event.registered} registered attendees checked in`} /></Grid>
          <Grid item xs={6} md={4}><StatisticsCard label="Checked in" value={event.checkedIn} /></Grid>
          <Grid item xs={6} md={4}><StatisticsCard label="Not checked in" value={event.notCheckedIn} /></Grid>
          <Grid item xs={12}>
            <Card>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Attendee</TableCell><TableCell>Ticket</TableCell><TableCell>Checked in at</TableCell></TableRow></TableHead>
                  <TableBody>
                    {checkedIn.length === 0 && <TableRow><TableCell colSpan={3}>Nobody has checked in yet.</TableCell></TableRow>}
                    {checkedIn.map((a) => <TableRow key={a.id}><TableCell>{a.name}</TableCell><TableCell>{a.ticketNo}</TableCell><TableCell>{fmtDateTime(a.checkInAt)}</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 5 && (
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}><StatisticsCard label="Registrations" value={event.registrationCount} helper={`${event.cancelledCount} cancelled`} /></Grid>
          <Grid item xs={6} md={3}><StatisticsCard label="Tickets sold" value={event.ticketsSold} helper={`${event.available} seats left`} /></Grid>
          <Grid item xs={6} md={3}><StatisticsCard label="Occupancy" value={`${event.occupancy}%`} percent={event.occupancy} /></Grid>
          <Grid item xs={6} md={3}><StatisticsCard label="Revenue" value={fmtMoney(event.revenue)} /></Grid>
          <Grid item xs={12} md={6}><TicketTypeSalesChart ticketTypes={types} /></Grid>
          <Grid item xs={12} md={6}><MonthlyTrendChart attendees={atts} /></Grid>
        </Grid>
      )}

      <ConfirmDialog open={cancelOpen} title="Cancel this event?" confirmText="Cancel event" confirmColor="error" onClose={() => setCancelOpen(false)}
        message={`"${event.name}" will be marked as Cancelled and all ${event.registrationCount} active registration(s) will be cancelled and refunded.`}
        onConfirm={() => { setEventStatus(event.id, 'Cancelled'); setCancelOpen(false); }} />
    </>
  );
}
