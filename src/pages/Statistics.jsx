import { useMemo, useState } from 'react';
import { Autocomplete, Card, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader';
import StatisticsCard from '../components/StatisticsCard';
import StatusChip from '../components/StatusChip';
import { AttendanceChart, MonthlyTrendChart, OccupancyChart, RegistrationsByEventChart, TicketSalesChart, TicketTypeSalesChart } from '../components/charts';
import { useData } from '../context/DataContext';
import { fmtMoney, pct } from '../utils/helpers';

export default function Statistics() {
  const { events, attendees, ticketTypes } = useData();
  const [selected, setSelected] = useState(null);

  const evs = useMemo(() => (selected ? events.filter((e) => e.id === selected.id) : events), [events, selected]);
  const atts = useMemo(() => (selected ? attendees.filter((a) => a.eventId === selected.id) : attendees), [attendees, selected]);
  const types = useMemo(() => (selected ? ticketTypes.filter((t) => t.eventId === selected.id) : ticketTypes), [ticketTypes, selected]);

  const s = useMemo(() => {
    const registered = evs.reduce((a, e) => a + e.registered, 0);
    const checkedIn = evs.reduce((a, e) => a + e.checkedIn, 0);
    const capacity = evs.reduce((a, e) => a + e.capacity, 0);
    return {
      registrations: evs.reduce((a, e) => a + e.registrationCount, 0),
      sold: evs.reduce((a, e) => a + e.ticketsSold, 0),
      available: evs.reduce((a, e) => a + e.available, 0),
      registered, checkedIn,
      attendance: pct(checkedIn, registered),
      occupancy: pct(registered, capacity),
      cancelled: evs.reduce((a, e) => a + e.cancelledCount, 0),
      revenue: evs.reduce((a, e) => a + e.revenue, 0),
    };
  }, [evs]);

  return (
    <>
      <PageHeader title="Event Statistics" subtitle="Occupancy = registered ÷ capacity × 100 · Attendance = checked in ÷ registered × 100" />
      <Card sx={{ p: 2, mb: 2, maxWidth: 520 }}>
        <Autocomplete options={events} value={selected} onChange={(_, v) => setSelected(v)} getOptionLabel={(e) => e.name} isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(p) => <TextField {...p} label="Event (leave empty for all events)" />} />
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={6} md={3}><StatisticsCard label="Total registrations" value={s.registrations} /></Grid>
        <Grid item xs={6} md={3}><StatisticsCard label="Total tickets sold" value={s.sold} /></Grid>
        <Grid item xs={6} md={3}><StatisticsCard label="Available tickets (seats)" value={s.available} /></Grid>
        <Grid item xs={6} md={3}><StatisticsCard label="Ticket revenue" value={fmtMoney(s.revenue)} /></Grid>
        <Grid item xs={12} md={4}><StatisticsCard label="Attendance" value={`${s.checkedIn} checked in`} percent={s.attendance} color="success" helper={`${s.attendance}% of ${s.registered} registered attendees`} /></Grid>
        <Grid item xs={12} md={4}><StatisticsCard label="Occupancy" value={`${s.occupancy}%`} percent={s.occupancy} color="warning" helper="Registered seats ÷ total capacity" /></Grid>
        <Grid item xs={12} md={4}><StatisticsCard label="Cancelled registrations" value={s.cancelled} color="error" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={6}><MonthlyTrendChart attendees={atts} /></Grid>
        <Grid item xs={12} lg={6}><TicketTypeSalesChart ticketTypes={types} /></Grid>
        <Grid item xs={12} lg={6}><RegistrationsByEventChart events={evs} /></Grid>
        <Grid item xs={12} lg={6}><TicketSalesChart events={evs} /></Grid>
        <Grid item xs={12} lg={6}><AttendanceChart events={evs} /></Grid>
        <Grid item xs={12} lg={6}><OccupancyChart events={evs} /></Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Per-event breakdown</Typography>
      <Card>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell><TableCell>Status</TableCell><TableCell align="right">Registered</TableCell><TableCell align="right">Checked In</TableCell><TableCell align="right">Not Checked In</TableCell>
                <TableCell align="right">Capacity</TableCell><TableCell sx={{ minWidth: 150 }}>Occupancy</TableCell><TableCell align="right">Tickets Sold</TableCell><TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evs.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{e.name}</TableCell>
                  <TableCell><StatusChip status={e.status} /></TableCell>
                  <TableCell align="right">{e.registered}</TableCell><TableCell align="right">{e.checkedIn}</TableCell><TableCell align="right">{e.notCheckedIn}</TableCell>
                  <TableCell align="right">{e.capacity}</TableCell>
                  <TableCell>{e.occupancy}%<LinearProgress variant="determinate" value={Math.min(e.occupancy, 100)} color={e.occupancy >= 80 ? 'warning' : 'primary'} sx={{ height: 5, borderRadius: 3 }} /></TableCell>
                  <TableCell align="right">{e.ticketsSold}</TableCell><TableCell align="right">{fmtMoney(e.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
