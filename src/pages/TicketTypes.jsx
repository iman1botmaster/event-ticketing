import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, LinearProgress, MenuItem, TextField, Tooltip,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { useData } from '../context/DataContext';
import { TICKET_NAMES } from '../utils/constants';
import { fmtDate, fmtPrice } from '../utils/helpers';

function TicketTypeDialog({ ticketType, defaultEventId, onClose }) {
  const { events, saveTicketType } = useData();
  const [v, setV] = useState({
    id: ticketType?.id,
    eventId: ticketType?.eventId ?? defaultEventId ?? '',
    name: ticketType?.name || '',
    description: ticketType?.description || '',
    price: ticketType?.price ?? 0,
    quantityAvailable: ticketType?.quantityAvailable ?? 50,
    salesStart: ticketType?.salesStart || '',
    salesEnd: ticketType?.salesEnd || '',
    status: ticketType?.status || 'Active',
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));
  const f = (k, label, extra = {}) => ({ label, value: v[k], onChange: set(k), error: !!errors[k], helperText: errors[k], ...extra });
  const event = events.find((e) => e.id === Number(v.eventId));

  const submit = (e) => {
    e.preventDefault();
    const res = saveTicketType(v);
    if (res.ok) onClose();
    else setErrors(res.errors);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{ticketType ? 'Edit ticket type' : 'Add ticket type'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={events} value={event || null} disabled={!!ticketType}
              getOptionLabel={(e) => `${e.code} – ${e.name}`} isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, val) => setV((p) => ({ ...p, eventId: val ? val.id : '' }))}
              renderInput={(params) => <TextField {...params} label="Event" required error={!!errors.eventId} helperText={errors.eventId} />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete freeSolo options={TICKET_NAMES} inputValue={v.name} onInputChange={(_, val) => setV((p) => ({ ...p, name: val }))}
              renderInput={(params) => <TextField {...params} label="Ticket name" required error={!!errors.name} helperText={errors.name} />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select {...f('status', 'Status')}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField>
          </Grid>
          <Grid item xs={12}><TextField required {...f('description', 'Description')} /></Grid>
          <Grid item xs={6}><TextField type="number" required inputProps={{ min: 0 }} {...f('price', 'Price (RWF)')} /></Grid>
          <Grid item xs={6}><TextField type="number" required inputProps={{ min: 1 }} {...f('quantityAvailable', 'Quantity available')} /></Grid>
          <Grid item xs={6}><TextField type="date" required InputLabelProps={{ shrink: true }} {...f('salesStart', 'Sales start')} /></Grid>
          <Grid item xs={6}><TextField type="date" required InputLabelProps={{ shrink: true }} {...f('salesEnd', 'Sales end')} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TicketTypes() {
  const { ticketTypes, events, deleteTicketType } = useData();
  const [params, setParams] = useSearchParams();
  const eventId = params.get('event') || '';
  const [q, setQ] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [removing, setRemoving] = useState(null);

  const selectedEvent = events.find((e) => e.id === Number(eventId)) || null;
  const rows = useMemo(
    () => ticketTypes.filter((t) => (!eventId || t.eventId === Number(eventId)) && `${t.name} ${t.eventName} ${t.description}`.toLowerCase().includes(q.trim().toLowerCase())),
    [ticketTypes, eventId, q]
  );

  const columns = [
    { field: 'id', headerName: 'Ticket ID', width: 90, type: 'number' },
    { field: 'eventName', headerName: 'Event', minWidth: 220, flex: 1 },
    { field: 'name', headerName: 'Ticket Name', width: 120 },
    { field: 'description', headerName: 'Description', width: 240 },
    { field: 'price', headerName: 'Price', width: 120, type: 'number', renderCell: (p) => fmtPrice(p.value) },
    { field: 'quantityAvailable', headerName: 'Available Qty', width: 110, type: 'number' },
    { field: 'sold', headerName: 'Sold', width: 80, type: 'number' },
    {
      field: 'remaining', headerName: 'Remaining', width: 140, type: 'number',
      renderCell: (p) => (
        <Box sx={{ width: '100%' }}>{p.value}<LinearProgress variant="determinate" value={p.row.quantityAvailable ? (p.row.sold / p.row.quantityAvailable) * 100 : 0} sx={{ height: 4, borderRadius: 2 }} /></Box>
      ),
    },
    { field: 'salesStart', headerName: 'Sales Start', width: 120, renderCell: (p) => fmtDate(p.value) },
    { field: 'salesEnd', headerName: 'Sales End', width: 120, renderCell: (p) => fmtDate(p.value) },
    { field: 'displayStatus', headerName: 'Status', width: 110, renderCell: (p) => <StatusChip status={p.value} /> },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false, filterable: false, disableColumnMenu: true,
      renderCell: (p) => (
        <>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => setDialog({ open: true, item: p.row })} aria-label="Edit ticket type"><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setRemoving(p.row)} aria-label="Delete ticket type"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Ticket Types" subtitle="Remaining tickets = quantity available − quantity sold"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, item: null })}>Add ticket type</Button>} />
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={events} value={selectedEvent} getOptionLabel={(e) => `${e.code} – ${e.name}`} isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, val) => setParams(val ? { event: val.id } : {})}
              renderInput={(p) => <TextField {...p} label="Filter by event" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField placeholder="Search ticket types…" value={q} onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search ticket types' }} />
          </Grid>
        </Grid>
      </Card>
      {rows.length === 0 ? <Alert severity="info">No ticket types found.</Alert> : (
        <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick slots={{ toolbar: GridToolbar }} rowHeight={52}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } }, columns: { columnVisibilityModel: { description: false } } }}
          pageSizeOptions={[10, 25, 50]} sx={{ bgcolor: 'background.paper' }} />
      )}
      {dialog.open && <TicketTypeDialog ticketType={dialog.item} defaultEventId={selectedEvent?.id} onClose={() => setDialog({ open: false, item: null })} />}
      <ConfirmDialog open={!!removing} title="Delete ticket type?" message={removing ? `Delete ${removing.name} for "${removing.eventName}"? Types with registrations cannot be deleted.` : ''}
        confirmText="Delete" confirmColor="error" onClose={() => setRemoving(null)} onConfirm={() => { deleteTicketType(removing.id); setRemoving(null); }} />
    </>
  );
}
