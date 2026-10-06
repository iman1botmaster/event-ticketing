import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Divider, Grid, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography,
} from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import StatusChip from './StatusChip';
import TicketCard from './TicketCard';
import { useData } from '../context/DataContext';
import { BOOKABLE, GENDERS, MAX_TICKETS } from '../utils/constants';
import { fmtDate, fmtMoney, fmtPrice } from '../utils/helpers';
import { validateRegistration } from '../utils/validation';

const STEPS = ['Event & ticket', 'Attendee details', 'Review & confirm'];
const STEP_KEYS = [['eventId', 'ticketTypeId', 'quantity'], ['fullName', 'gender', 'phone', 'email', 'organization', 'refNo'], []];
const EMPTY = { eventId: '', ticketTypeId: '', quantity: 1, fullName: '', gender: '', phone: '', email: '', organization: '', refNo: '' };

export default function RegistrationForm({ initialEventId }) {
  const data = useData();
  const { events, ticketTypes, tickets, register } = data;
  const [values, setValues] = useState({ ...EMPTY, eventId: initialEventId || '' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(null);

  const event = events.find((e) => e.id === Number(values.eventId));
  const types = useMemo(() => ticketTypes.filter((t) => t.eventId === Number(values.eventId)), [ticketTypes, values.eventId]);
  const type = types.find((t) => t.id === Number(values.ticketTypeId));
  const closed = event && !BOOKABLE.includes(event.status);
  const full = event && BOOKABLE.includes(event.status) && event.available === 0;
  const total = type ? type.price * (Number(values.quantity) || 0) : 0;

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value, ...(k === 'eventId' ? { ticketTypeId: '' } : {}) }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const field = (k, label, extra = {}) => ({ label, value: values[k], onChange: set(k), error: !!errors[k], helperText: errors[k], ...extra });

  const next = () => {
    const all = validateRegistration(values, data);
    const mine = Object.fromEntries(Object.entries(all).filter(([k]) => STEP_KEYS[step].includes(k)));
    setErrors(mine);
    if (!Object.keys(mine).length) setStep((s) => s + 1);
  };

  const submit = () => {
    setConfirmOpen(false);
    const res = register(values);
    if (res.ok) {
      setDone(res);
    } else {
      setErrors(res.errors);
      setStep(STEP_KEYS[0].some((k) => res.errors[k]) ? 0 : 1);
    }
  };

  const reset = () => { setValues({ ...EMPTY }); setErrors({}); setStep(0); setDone(null); };

  if (done) {
    const ticket = tickets.find((t) => t.id === done.ticket.id);
    return (
      <Stack spacing={3}>
        <Alert severity="success">Registration <strong>{done.registration.regNo}</strong> confirmed. Ticket <strong>{done.ticket.ticketNo}</strong> has been generated.</Alert>
        {ticket && <TicketCard ticket={ticket} />}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap className="no-print">
          <Button variant="contained" onClick={reset}>Register another attendee</Button>
          <Button component={Link} to={`/attendees/${done.attendee.id}`}>View attendee</Button>
          <Button component={Link} to="/tickets">View all tickets</Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={events}
                value={event || null}
                getOptionLabel={(e) => `${e.code} – ${e.name}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                onChange={(_, v) => { setValues((p) => ({ ...p, eventId: v ? v.id : '', ticketTypeId: '' })); setErrors({}); }}
                renderOption={(props, e) => (
                  <li {...props} key={e.id}><Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 1 }}><span>{e.name}</span><StatusChip status={e.status} /></Box></li>
                )}
                renderInput={(params) => <TextField {...params} label="Event" required error={!!errors.eventId} helperText={errors.eventId} />}
              />
            </Grid>
            {closed && <Grid item xs={12}><Alert severity="warning">This event is <strong>{event.status}</strong>, so it is not open for registration.</Alert></Grid>}
            {full && <Grid item xs={12}><Alert severity="error">This event is fully booked – no seats are left.</Alert></Grid>}
            {event && !closed && (
              <>
                <Grid item xs={12} sm={8}>
                  <TextField select required {...field('ticketTypeId', 'Ticket type')}>
                    {types.length === 0 && <MenuItem disabled value="">No ticket types for this event</MenuItem>}
                    {types.map((t) => (
                      <MenuItem key={t.id} value={t.id} disabled={t.displayStatus !== 'Active'}>
                        {t.name} – {fmtPrice(t.price)} ({t.displayStatus === 'Active' ? `${t.remaining} left` : t.displayStatus})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField type="number" required inputProps={{ min: 1, max: MAX_TICKETS }} {...field('quantity', 'Number of tickets')} />
                </Grid>
                {type && type.remaining > 0 && type.remaining <= 5 && <Grid item xs={12}><Alert severity="warning">Only {type.remaining} {type.name} ticket(s) left!</Alert></Grid>}
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">{event.available} of {event.capacity} seats still available · {fmtDate(event.startDate)} · {event.venue}</Typography></Grid>
              </>
            )}
          </Grid>
        )}

        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField required {...field('fullName', 'Full name')} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select required {...field('gender', 'Gender')}>{GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}</TextField>
            </Grid>
            <Grid item xs={12} sm={6}><TextField required type="tel" {...field('phone', 'Phone')} /></Grid>
            <Grid item xs={12} sm={6}><TextField required type="email" {...field('email', 'Email')} /></Grid>
            <Grid item xs={12} sm={6}><TextField {...field('organization', 'Organization (optional)')} /></Grid>
            <Grid item xs={12} sm={6}><TextField required {...field('refNo', 'ID / reference number')} /></Grid>
          </Grid>
        )}

        {step === 2 && event && type && (
          <Box>
            <Typography variant="h6" gutterBottom>Review your registration</Typography>
            <Grid container spacing={1.5}>
              {[
                ['Event', event.name], ['Date', `${fmtDate(event.startDate)} · ${event.startTime}`], ['Venue', `${event.venue}, ${event.location}`],
                ['Ticket type', `${type.name} × ${values.quantity}`], ['Price per ticket', fmtPrice(type.price)],
                ['Attendee', values.fullName], ['Gender', values.gender], ['Phone', values.phone], ['Email', values.email],
                ['Organization', values.organization || '—'], ['ID / reference', values.refNo],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography variant="body2" fontWeight={600}>{v}</Typography></Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Total: {fmtMoney(total)}</Typography>
            <Typography variant="caption" color="text.secondary">Simulated payment – no real payment is taken.</Typography>
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)} color="inherit">Back</Button>
          {step < 2 ? (
            <Button variant="contained" onClick={next} disabled={step === 0 && (closed || full)}>Next</Button>
          ) : (
            <Button variant="contained" onClick={() => setConfirmOpen(true)}>Confirm registration</Button>
          )}
        </Stack>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        title="Complete registration?"
        message={event && type ? `Register ${values.fullName} for ${event.name} with ${values.quantity} × ${type.name} ticket(s) – total ${fmtMoney(total)}.` : ''}
        confirmText="Register"
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </Card>
  );
}
