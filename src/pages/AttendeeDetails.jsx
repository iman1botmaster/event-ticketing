import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CancelIcon from '@mui/icons-material/Cancel';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import TicketCard from '../components/TicketCard';
import { useData } from '../context/DataContext';
import { fmtDate, fmtDateTime, fmtPrice, printNow } from '../utils/helpers';

function Info({ title, rows }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Grid container spacing={1.5}>
          {rows.map(([k, v]) => (
            <Grid item xs={6} key={k}>
              <Typography variant="caption" color="text.secondary">{k}</Typography>
              <Typography variant="body2" fontWeight={600} component="div">{v || '—'}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function AttendeeDetails() {
  const { attendeeId } = useParams();
  const { attendees, events, tickets, checkIn, cancelRegistration } = useData();
  const [dlg, setDlg] = useState(null); // 'checkin' | 'cancel'
  const [ticketOpen, setTicketOpen] = useState(false);

  const a = attendees.find((x) => x.id === Number(attendeeId));
  if (!a) return <Alert severity="error" action={<Button component={Link} to="/attendees">Back</Button>}>Attendee not found.</Alert>;
  const event = events.find((e) => e.id === a.eventId);
  const ticket = tickets.find((t) => t.attendeeId === a.id);
  const canCheckIn = ['Registered', 'Not Checked In'].includes(a.attendance);
  const canCancel = !['Cancelled', 'Checked In'].includes(a.attendance);

  return (
    <>
      <PageHeader title={a.name} subtitle={`${a.regNo} · ${a.eventName}`}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon />} component={Link} to="/attendees">Back</Button>
            <Button variant="contained" color="success" startIcon={<HowToRegIcon />} disabled={!canCheckIn} onClick={() => setDlg('checkin')}>Check In</Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} disabled={!canCancel} onClick={() => setDlg('cancel')}>Cancel Registration</Button>
            <Button startIcon={<QrCode2Icon />} onClick={() => setTicketOpen(true)}>View Ticket</Button>
            <Button startIcon={<PrintIcon />} onClick={() => { setTicketOpen(true); setTimeout(() => printNow('dialog'), 400); }}>Print Ticket</Button>
          </>
        } />
      {a.attendance === 'Cancelled' && <Alert severity="warning" sx={{ mb: 2 }}>This registration was cancelled and its tickets were released.</Alert>}
      {event?.status === 'Cancelled' && <Alert severity="error" sx={{ mb: 2 }}>The event has been cancelled.</Alert>}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}><StatusChip status={a.attendance} size="medium" /><StatusChip status={a.registrationStatus} size="medium" /></Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Info title="Attendee information" rows={[['Full name', a.name], ['Gender', a.gender], ['Phone', a.phone], ['Email', a.email], ['Organization', a.organization], ['ID / reference', a.refNo]]} /></Grid>
        <Grid item xs={12} md={6}><Info title="Event information" rows={[['Event', event?.name], ['Code', event?.code], ['Date', `${fmtDate(event?.startDate)} – ${fmtDate(event?.endDate)}`], ['Venue', `${event?.venue}, ${event?.location}`], ['Organizer', event?.organizer], ['Contact', event?.contact]]} /></Grid>
        <Grid item xs={12} md={6}><Info title="Ticket information" rows={[['Ticket number', a.ticketNo], ['Ticket type', a.ticketTypeName], ['Quantity', a.quantity], ['Unit price', fmtPrice(a.unitPrice)], ['Total', fmtPrice(a.total)], ['Payment', a.paymentStatus], ['Ticket status', a.ticketStatus]]} /></Grid>
        <Grid item xs={12} md={6}><Info title="Registration & attendance" rows={[['Registration number', a.regNo], ['Registration date', fmtDate(a.registrationDate)], ['Registration status', a.registrationStatus], ['Attendance status', a.attendance], ['Check-in date/time', fmtDateTime(a.checkInAt)]]} /></Grid>
      </Grid>

      <ConfirmDialog open={dlg === 'checkin'} title="Confirm check-in" message={`Check in ${a.name} for ${a.eventName}?`} confirmText="Check in" onClose={() => setDlg(null)} onConfirm={() => { checkIn(a.id); setDlg(null); }} />
      <ConfirmDialog open={dlg === 'cancel'} title="Cancel registration" message={`Cancel registration ${a.regNo}? The tickets will be released.`} confirmText="Cancel registration" confirmColor="error" onClose={() => setDlg(null)} onConfirm={() => { cancelRegistration(a.id); setDlg(null); }} />
      <Dialog open={ticketOpen} onClose={() => setTicketOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="no-print">Ticket {a.ticketNo}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>{ticket && <TicketCard ticket={ticket} printKind="dialog" />}</Box>
        </DialogContent>
        <DialogActions className="no-print" sx={{ px: 3, pb: 2 }}><Button onClick={() => setTicketOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </>
  );
}
