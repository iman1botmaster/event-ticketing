import { Box, Button, Card, Divider, Grid, Stack, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import StatusChip from './StatusChip';
import { fmtDate, fmtPrice, printNow } from '../utils/helpers';

// Mock QR-like pattern drawn from the ticket number. It is NOT a real, scannable code.
function MockQr({ value, size = 112 }) {
  const n = 21;
  let seed = 7;
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const next = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed; };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && ((next() >>> 16) & 1)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  const finder = (x, y) => (
    <g key={`f${x}${y}`}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
  );
  return (
    <svg width={size} height={size} viewBox="-1 -1 23 23" role="img" aria-label="Mock QR code" style={{ background: '#fff', borderRadius: 6 }}>
      <g fill="#111">{cells}{finder(0, 0)}{finder(n - 7, 0)}{finder(0, n - 7)}</g>
    </svg>
  );
}

const Field = ({ label, children }) => (
  <Grid item xs={6}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{children}</Typography>
  </Grid>
);

export default function TicketCard({ ticket, showPrint = true, printKind = 'page' }) {
  return (
    <Box>
      <Card className="print-area" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderLeft: 8, borderLeftColor: 'primary.main', maxWidth: 680, mx: 'auto' }}>
        <Box sx={{ flex: 1, p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">{ticket.organizer}</Typography>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{ticket.eventName}</Typography>
            </Box>
            <StatusChip status={ticket.status} />
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Grid container spacing={1.5}>
            <Field label="Attendee">{ticket.attendeeName}</Field>
            <Field label="Ticket number">{ticket.ticketNo}</Field>
            <Field label="Date">{fmtDate(ticket.eventDate)}</Field>
            <Field label="Venue">{ticket.venue}</Field>
            <Field label="Ticket type">{ticket.ticketTypeName} × {ticket.quantity}</Field>
            <Field label="Price">{fmtPrice(ticket.unitPrice)}{ticket.quantity > 1 ? ` each (total ${fmtPrice(ticket.total)})` : ''}</Field>
            <Field label="Registration number">{ticket.regNo}</Field>
            <Field label="Payment">{ticket.paymentStatus}</Field>
          </Grid>
        </Box>
        <Box sx={{ p: 2.5, textAlign: 'center', borderLeft: { sm: '2px dashed' }, borderTop: { xs: '2px dashed', sm: 0 }, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <MockQr value={ticket.ticketNo} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, maxWidth: 130 }}>Sample pattern only – not a real ticketing code</Typography>
        </Box>
      </Card>
      {showPrint && (
        <Box sx={{ textAlign: 'center', mt: 2 }} className="no-print">
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => printNow(printKind)}>Print Ticket</Button>
        </Box>
      )}
    </Box>
  );
}
