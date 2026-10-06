import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Grid, InputAdornment, MenuItem, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PageHeader from '../components/PageHeader';
import EventTable from '../components/EventTable';
import EventCard from '../components/EventCard';
import EventFormDialog from '../components/EventFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { useData } from '../context/DataContext';
import { EVENT_STATUSES } from '../utils/constants';

export default function Events() {
  const { events, categories, deleteEvent } = useData();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [view, setView] = useState('table');
  const [form, setForm] = useState({ open: false, event: null });
  const [removing, setRemoving] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events.filter(
      (e) =>
        (!s || [e.name, e.code, e.organizer, e.venue, e.location].some((x) => x.toLowerCase().includes(s))) &&
        (!category || e.categoryId === Number(category)) &&
        (!status || e.status === status) &&
        (!from || e.startDate >= from) &&
        (!to || e.startDate <= to)
    );
  }, [events, q, category, status, from, to]);

  const clear = () => { setQ(''); setCategory(''); setStatus(''); setFrom(''); setTo(''); };
  const filtersOn = q || category || status || from || to;
  const openEdit = useMemo(() => (e) => setForm({ open: true, event: e }), []);
  const askDelete = useMemo(() => (e) => setRemoving(e), []);

  return (
    <>
      <PageHeader
        title="Events"
        subtitle={`${filtered.length} of ${events.length} events`}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ open: true, event: null })}>Add event</Button>}
      />
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField placeholder="Search name, code, organizer, venue…" value={q} onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search events' }} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {EVENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}><TextField type="date" label="Starts from" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={6} md={2}><TextField type="date" label="Starts until" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button size="small" onClick={clear} disabled={!filtersOn}>Clear filters</Button>
            <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="View mode">
              <ToggleButton value="table" aria-label="Table view"><ViewListIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="cards" aria-label="Card view"><ViewModuleIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Card>

      {filtered.length === 0 ? (
        <Alert severity="info">No events match your filters.</Alert>
      ) : view === 'table' ? (
        <Box sx={{ width: '100%' }}><EventTable rows={filtered} onEdit={openEdit} onDelete={askDelete} /></Box>
      ) : (
        <Grid container spacing={2}>{filtered.map((e) => <Grid item xs={12} sm={6} lg={4} key={e.id}><EventCard event={e} /></Grid>)}</Grid>
      )}

      {form.open && <EventFormDialog open event={form.event} onClose={() => setForm({ open: false, event: null })} />}
      <ConfirmDialog
        open={!!removing}
        title="Delete event?"
        message={removing ? `"${removing.name}" and its ticket types, registrations, attendees and tickets will be permanently deleted.` : ''}
        confirmText="Delete"
        confirmColor="error"
        onClose={() => setRemoving(null)}
        onConfirm={() => { deleteEvent(removing.id); setRemoving(null); }}
      />
    </>
  );
}
