import { useMemo, useState } from 'react';
import { Alert, Autocomplete, Button, Card, Grid, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AttendeeTable from '../components/AttendeeTable';
import { useData } from '../context/DataContext';
import { ATTENDANCE_STATUSES } from '../utils/constants';

export default function Attendees() {
  const { attendees, events, ticketTypes } = useData();
  const [q, setQ] = useState('');
  const [event, setEvent] = useState(null);
  const [type, setType] = useState('');
  const [attendance, setAttendance] = useState('');

  const typeNames = useMemo(() => [...new Set(ticketTypes.map((t) => t.name))].sort(), [ticketTypes]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return attendees.filter(
      (a) =>
        (!s || [a.name, a.email, a.phone, a.regNo, a.ticketNo, a.organization].some((x) => String(x || '').toLowerCase().includes(s))) &&
        (!event || a.eventId === event.id) &&
        (!type || a.ticketTypeName === type) &&
        (!attendance || a.attendance === attendance)
    );
  }, [attendees, q, event, type, attendance]);

  return (
    <>
      <PageHeader title="Attendees" subtitle={`${rows.length} of ${attendees.length} attendees`}
        actions={<Button variant="contained" startIcon={<AddIcon />} component={Link} to="/registration">Register attendee</Button>} />
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField placeholder="Search name, email, reg. no…" value={q} onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search attendees' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete options={events} value={event} onChange={(_, v) => setEvent(v)} getOptionLabel={(e) => e.name} isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(p) => <TextField {...p} label="Event" />} />
          </Grid>
          <Grid item xs={6} md={2.5}>
            <TextField select label="Ticket type" value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="">All</MenuItem>{typeNames.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2.5}>
            <TextField select label="Attendance" value={attendance} onChange={(e) => setAttendance(e.target.value)}>
              <MenuItem value="">All</MenuItem>{ATTENDANCE_STATUSES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Card>
      {rows.length === 0 ? <Alert severity="info">No attendees match your filters.</Alert> : <AttendeeTable rows={rows} />}
    </>
  );
}
