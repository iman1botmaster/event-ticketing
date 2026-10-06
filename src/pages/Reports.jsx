import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PageHeader from '../components/PageHeader';
import { useData } from '../context/DataContext';
import { ATTENDANCE_STATUSES, REG_STATUSES } from '../utils/constants';
import { exportCsv, fmtDate, fmtMoney, fmtPrice, groupBy, monthLabel, pct, printNow } from '../utils/helpers';

const REPORTS = {
  registrations: 'Event registrations',
  attendees: 'Attendee list',
  sales: 'Ticket sales',
  attendance: 'Attendance',
  capacity: 'Event capacity',
  revenue: 'Event revenue',
  typePerf: 'Ticket type performance',
  category: 'Event category statistics',
  monthly: 'Monthly registrations',
};
const sum = (list, fn) => list.reduce((s, x) => s + fn(x), 0);

export default function Reports() {
  const { events, attendees, ticketTypes, categories } = useData();
  const [report, setReport] = useState('registrations');
  const [f, setF] = useState({ eventId: '', categoryId: '', typeName: '', regStatus: '', attendance: '', from: '', to: '' });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const typeNames = useMemo(() => [...new Set(ticketTypes.map((t) => t.name))].sort(), [ticketTypes]);

  const att = useMemo(
    () =>
      attendees.filter(
        (a) =>
          (!f.eventId || a.eventId === Number(f.eventId)) &&
          (!f.categoryId || a.categoryId === Number(f.categoryId)) &&
          (!f.typeName || a.ticketTypeName === f.typeName) &&
          (!f.regStatus || a.registrationStatus === f.regStatus) &&
          (!f.attendance || a.attendance === f.attendance) &&
          (!f.from || a.registrationDate >= f.from) &&
          (!f.to || a.registrationDate <= f.to)
      ),
    [attendees, f]
  );

  const { columns, rows } = useMemo(() => {
    const active = att.filter((a) => a.registrationStatus !== 'Cancelled');
    const evs = events.filter((e) => (!f.eventId || e.id === Number(f.eventId)) && (!f.categoryId || e.categoryId === Number(f.categoryId)));
    const col = (key, label) => ({ key, label });

    switch (report) {
      case 'registrations':
        return {
          columns: [col('regNo', 'Registration No.'), col('name', 'Attendee'), col('eventName', 'Event'), col('ticketTypeName', 'Ticket Type'), col('quantity', 'Tickets'), col('date', 'Date'), col('registrationStatus', 'Status')],
          rows: att.map((a) => ({ ...a, date: fmtDate(a.registrationDate) })),
        };
      case 'attendees':
        return {
          columns: [col('name', 'Name'), col('email', 'Email'), col('phone', 'Phone'), col('organization', 'Organization'), col('eventName', 'Event'), col('ticketTypeName', 'Ticket Type'), col('attendance', 'Attendance')],
          rows: att,
        };
      case 'sales':
        return {
          columns: [col('ticketNo', 'Ticket No.'), col('regNo', 'Registration No.'), col('name', 'Attendee'), col('eventName', 'Event'), col('ticketTypeName', 'Ticket Type'), col('quantity', 'Qty'), col('price', 'Unit Price'), col('totalFmt', 'Total'), col('paymentStatus', 'Payment'), col('ticketStatus', 'Ticket Status')],
          rows: att.map((a) => ({ ...a, price: fmtPrice(a.unitPrice), totalFmt: fmtMoney(a.total) })),
        };
      case 'attendance':
        return {
          columns: [col('name', 'Event'), col('registered', 'Registered'), col('checkedIn', 'Checked In'), col('notCheckedIn', 'Not Checked In'), col('rate', 'Attendance Rate')],
          rows: evs.map((e) => {
            const mine = active.filter((a) => a.eventId === e.id);
            const registered = sum(mine, (a) => a.quantity);
            const checkedIn = sum(mine.filter((a) => a.attendance === 'Checked In'), (a) => a.quantity);
            return { name: e.name, registered, checkedIn, notCheckedIn: registered - checkedIn, rate: `${pct(checkedIn, registered)}%` };
          }),
        };
      case 'capacity':
        return {
          columns: [col('name', 'Event'), col('categoryName', 'Category'), col('status', 'Status'), col('capacity', 'Capacity'), col('registered', 'Registered'), col('available', 'Available'), col('occ', 'Occupancy')],
          rows: evs.map((e) => ({ ...e, occ: `${e.occupancy}%` })),
        };
      case 'revenue':
        return {
          columns: [col('name', 'Event'), col('categoryName', 'Category'), col('tickets', 'Tickets Sold'), col('revenue', 'Revenue')],
          rows: evs.map((e) => {
            const mine = active.filter((a) => a.eventId === e.id);
            return { name: e.name, categoryName: e.categoryName, tickets: sum(mine, (a) => a.quantity), revenue: fmtMoney(sum(mine, (a) => a.total)) };
          }),
        };
      case 'typePerf':
        return {
          columns: [col('eventName', 'Event'), col('name', 'Ticket Type'), col('price', 'Price'), col('quantityAvailable', 'Allocated'), col('sold', 'Sold (filtered)'), col('remaining', 'Remaining'), col('revenue', 'Revenue (filtered)')],
          rows: ticketTypes
            .filter((t) => (!f.eventId || t.eventId === Number(f.eventId)) && (!f.typeName || t.name === f.typeName) && evs.some((e) => e.id === t.eventId))
            .map((t) => {
              const mine = active.filter((a) => a.ticketTypeId === t.id);
              return { ...t, price: fmtPrice(t.price), sold: sum(mine, (a) => a.quantity), revenue: fmtMoney(sum(mine, (a) => a.total)) };
            }),
        };
      case 'category':
        return {
          columns: [col('name', 'Category'), col('events', 'Events'), col('registrations', 'Registrations'), col('tickets', 'Tickets Sold'), col('revenue', 'Revenue')],
          rows: categories
            .filter((c) => !f.categoryId || c.id === Number(f.categoryId))
            .map((c) => {
              const mine = active.filter((a) => a.categoryId === c.id);
              return { name: c.name, events: evs.filter((e) => e.categoryId === c.id).length, registrations: mine.length, tickets: sum(mine, (a) => a.quantity), revenue: fmtMoney(sum(mine, (a) => a.total)) };
            }),
        };
      default: // monthly
        return {
          columns: [col('month', 'Month'), col('registrations', 'Registrations'), col('tickets', 'Tickets'), col('revenue', 'Revenue')],
          rows: Object.entries(groupBy(active.filter((a) => a.registrationDate), (a) => a.registrationDate.slice(0, 7)))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, list]) => ({ month: monthLabel(k), registrations: list.length, tickets: sum(list, (a) => a.quantity), revenue: fmtMoney(sum(list, (a) => a.total)) })),
        };
    }
  }, [report, att, events, ticketTypes, categories, f.eventId, f.categoryId, f.typeName]);

  const clear = () => setF({ eventId: '', categoryId: '', typeName: '', regStatus: '', attendance: '', from: '', to: '' });

  return (
    <>
      <PageHeader title="Reports" subtitle="Choose a report, apply filters, then print or export to CSV"
        actions={
          <>
            <Button startIcon={<FileDownloadIcon />} disabled={!rows.length} onClick={() => exportCsv(`${report}-report.csv`, columns, rows)}>Export CSV</Button>
            <Button variant="contained" startIcon={<PrintIcon />} disabled={!rows.length} onClick={() => printNow('page')}>Print Report</Button>
          </>
        } />
      <Card sx={{ p: 2, mb: 2 }} className="no-print">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField select label="Report" value={report} onChange={(e) => setReport(e.target.value)}>{Object.entries(REPORTS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select label="Event" value={f.eventId} onChange={set('eventId')}><MenuItem value="">All events</MenuItem>{events.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select label="Category" value={f.categoryId} onChange={set('categoryId')}><MenuItem value="">All categories</MenuItem>{categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={3}><TextField select label="Ticket type" value={f.typeName} onChange={set('typeName')}><MenuItem value="">All</MenuItem>{typeNames.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={3}><TextField select label="Registration status" value={f.regStatus} onChange={set('regStatus')}><MenuItem value="">All</MenuItem>{REG_STATUSES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={3}><TextField select label="Attendance status" value={f.attendance} onChange={set('attendance')}><MenuItem value="">All</MenuItem>{ATTENDANCE_STATUSES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={3}><Button fullWidth onClick={clear}>Clear filters</Button></Grid>
          <Grid item xs={6} md={3}><TextField type="date" label="Registered from" value={f.from} onChange={set('from')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={6} md={3}><TextField type="date" label="Registered until" value={f.to} onChange={set('to')} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
      </Card>

      {rows.length === 0 ? <Alert severity="info">No data matches the selected filters.</Alert> : (
        <Card className="print-area">
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{REPORTS[report]}</Typography>
            <Typography variant="caption" color="text.secondary">Generated {new Date().toLocaleString('en-GB')} · {rows.length} row(s)</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 560, '@media print': { maxHeight: 'none' } }}>
            <Table size="small" stickyHeader>
              <TableHead><TableRow>{columns.map((c) => <TableCell key={c.key} sx={{ fontWeight: 700 }}>{c.label}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {rows.map((r, i) => <TableRow key={i} hover>{columns.map((c) => <TableCell key={c.key}>{r[c.key]}</TableCell>)}</TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </>
  );
}
