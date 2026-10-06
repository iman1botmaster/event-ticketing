import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Card, CardContent, Chip, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupsIcon from '@mui/icons-material/Groups';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PageHeader from '../components/PageHeader';
import DashboardCard from '../components/DashboardCard';
import EventCard from '../components/EventCard';
import StatusChip from '../components/StatusChip';
import {
  AttendanceChart, MonthlyTrendChart, RegistrationsByEventChart, StatusPieChart, TicketSalesChart, TicketTypeSalesChart,
} from '../components/charts';
import { useData } from '../context/DataContext';
import { fmtDate, fmtMoney } from '../utils/helpers';

function ListPanel({ title, items, empty = 'Nothing to show yet' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{empty}</Typography>
        ) : (
          <List dense disablePadding>
            {items.map((it) => (
              <ListItem key={it.key} disableGutters divider component={Link} to={it.to} sx={{ color: 'inherit', textDecoration: 'none' }} secondaryAction={it.chip}>
                <ListItemText primary={it.primary} secondary={it.secondary} primaryTypographyProps={{ noWrap: true, fontWeight: 600 }} sx={{ pr: 9 }} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { totals, events, attendees, tickets, ticketTypes, nearCapacity } = useData();

  const upcoming = useMemo(
    () => events.filter((e) => ['Upcoming', 'Published', 'Ongoing'].includes(e.status)).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 3),
    [events]
  );
  const recentEvents = useMemo(() => [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id).slice(0, 5), [events]);
  const recentRegs = useMemo(() => [...attendees].sort((a, b) => b.registrationDate.localeCompare(a.registrationDate) || b.id - a.id).slice(0, 5), [attendees]);
  const popular = useMemo(() => [...events].sort((a, b) => b.registered - a.registered).slice(0, 5), [events]);
  const recentSales = useMemo(
    () => tickets.filter((t) => t.status !== 'Cancelled').sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5),
    [tickets]
  );

  const cards = [
    ['Total Events', totals.totalEvents, <EventIcon />, 'primary'],
    ['Upcoming Events', totals.upcomingEvents, <EventAvailableIcon />, 'info'],
    ['Completed Events', totals.completedEvents, <DoneAllIcon />, 'success'],
    ['Total Registrations', totals.totalRegistrations, <HowToRegIcon />, 'primary'],
    ['Total Attendees', totals.totalAttendees, <GroupsIcon />, 'secondary'],
    ['Tickets Sold', totals.ticketsSold, <ConfirmationNumberIcon />, 'success'],
    ['Available Tickets', totals.availableTickets, <EventSeatIcon />, 'info'],
    ['Total Ticket Revenue', fmtMoney(totals.revenue), <PaymentsIcon />, 'secondary'],
    ['Cancelled Registrations', totals.cancelled, <EventBusyIcon />, 'error'],
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of events, registrations, tickets and attendance" />

      <Grid container spacing={2}>
        {cards.map(([title, value, icon, color]) => (
          <Grid item xs={12} sm={6} lg={4} key={title}><DashboardCard title={title} value={value} icon={icon} color={color} /></Grid>
        ))}
      </Grid>

      {nearCapacity.length > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {nearCapacity.length} event(s) are approaching capacity: {nearCapacity.map((e) => `${e.name} (${e.occupancy}%)`).join(', ')}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Upcoming events</Typography>
      <Grid container spacing={2}>
        {upcoming.length === 0 && <Grid item xs={12}><Alert severity="info">No upcoming events. Create one from the Events page.</Alert></Grid>}
        {upcoming.map((e) => <Grid item xs={12} md={4} key={e.id}><EventCard event={e} /></Grid>)}
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Charts</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}><RegistrationsByEventChart events={events} /></Grid>
        <Grid item xs={12} lg={6}><TicketSalesChart events={events} /></Grid>
        <Grid item xs={12} lg={6}><AttendanceChart events={events} /></Grid>
        <Grid item xs={12} lg={6}><MonthlyTrendChart attendees={attendees} /></Grid>
        <Grid item xs={12} lg={6}><TicketTypeSalesChart ticketTypes={ticketTypes} /></Grid>
        <Grid item xs={12} lg={6}><StatusPieChart events={events} /></Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Activity</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ListPanel title="Recently created events" items={recentEvents.map((e) => ({ key: e.id, to: `/events/${e.id}`, primary: e.name, secondary: `Created ${fmtDate(e.createdAt)}`, chip: <StatusChip status={e.status} /> }))} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListPanel title="Recent registrations" items={recentRegs.map((a) => ({ key: a.id, to: `/attendees/${a.id}`, primary: a.name, secondary: `${a.regNo} · ${a.eventName}`, chip: <StatusChip status={a.registrationStatus} /> }))} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListPanel title="Popular events" items={popular.map((e) => ({ key: e.id, to: `/events/${e.id}`, primary: e.name, secondary: `${e.registered} seats registered`, chip: <Chip size="small" label={`${e.occupancy}%`} /> }))} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListPanel title="Recent ticket sales" items={recentSales.map((t) => ({ key: t.id, to: '/tickets', primary: `${t.ticketNo} · ${t.attendeeName}`, secondary: `${t.eventName} · ${t.ticketTypeName} × ${t.quantity}`, chip: <Chip size="small" label={fmtMoney(t.total)} /> }))} />
        </Grid>
        <Grid item xs={12}>
          <ListPanel title="Events approaching capacity" empty="No event is above 80% occupancy" items={nearCapacity.map((e) => ({ key: e.id, to: `/events/${e.id}`, primary: e.name, secondary: `${e.registered}/${e.capacity} seats · ${e.available} left`, chip: <Chip size="small" color="warning" label={`${e.occupancy}%`} /> }))} />
        </Grid>
      </Grid>
      <Box sx={{ height: 16 }} />
    </>
  );
}
