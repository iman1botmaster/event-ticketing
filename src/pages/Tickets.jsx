import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import TicketCard from '../components/TicketCard';
import { useData } from '../context/DataContext';
import { PAYMENT_STATUSES, TICKET_STATUSES } from '../utils/constants';
import { fmtDate, fmtPrice } from '../utils/helpers';

export default function Tickets() {
  const { tickets } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tickets.filter(
      (t) =>
        (!s || [t.ticketNo, t.regNo, t.attendeeName, t.eventName].some((x) => String(x || '').toLowerCase().includes(s))) &&
        (!status || t.status === status) &&
        (!payment || t.paymentStatus === payment)
    );
  }, [tickets, q, status, payment]);

  const columns = [
    { field: 'ticketNo', headerName: 'Ticket No.', width: 150 },
    { field: 'regNo', headerName: 'Registration No.', width: 150 },
    { field: 'attendeeName', headerName: 'Attendee', width: 180 },
    { field: 'eventName', headerName: 'Event', minWidth: 220, flex: 1 },
    { field: 'ticketTypeName', headerName: 'Ticket Type', width: 120 },
    { field: 'quantity', headerName: 'Qty', width: 70, type: 'number' },
    { field: 'unitPrice', headerName: 'Price', width: 120, type: 'number', renderCell: (p) => fmtPrice(p.value) },
    { field: 'date', headerName: 'Registered On', width: 130, renderCell: (p) => fmtDate(p.value) },
    { field: 'paymentStatus', headerName: 'Payment', width: 110, renderCell: (p) => <StatusChip status={p.value} /> },
    { field: 'status', headerName: 'Ticket Status', width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
    {
      field: 'actions', headerName: 'View', width: 80, sortable: false, filterable: false, disableColumnMenu: true,
      renderCell: (p) => <Tooltip title="View / print ticket"><IconButton size="small" onClick={() => setViewing(p.row)} aria-label="View ticket"><QrCode2Icon fontSize="small" /></IconButton></Tooltip>,
    },
  ];

  return (
    <>
      <PageHeader title="Tickets" subtitle={`${rows.length} of ${tickets.length} tickets`} />
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField placeholder="Search ticket no., attendee, event…" value={q} onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search tickets' }} />
          </Grid>
          <Grid item xs={6} md={3}><TextField select label="Ticket status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All</MenuItem>{TICKET_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={3}><TextField select label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}><MenuItem value="">All</MenuItem>{PAYMENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
        </Grid>
      </Card>
      {rows.length === 0 ? <Alert severity="info">No tickets match your filters.</Alert> : (
        <Box sx={{ width: '100%' }}>
          <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick slots={{ toolbar: GridToolbar }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10, 25, 50]} sx={{ bgcolor: 'background.paper' }} />
        </Box>
      )}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
        <DialogTitle className="no-print">Ticket {viewing?.ticketNo}</DialogTitle>
        <DialogContent><Box sx={{ pt: 1 }}>{viewing && <TicketCard ticket={viewing} printKind="dialog" />}</Box></DialogContent>
        <DialogActions className="no-print" sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewing(null)}>Close</Button></DialogActions>
      </Dialog>
    </>
  );
}
