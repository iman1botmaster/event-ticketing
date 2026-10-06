import { useState } from 'react';
import { Alert, Box, Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useData } from '../context/DataContext';
import { EVENT_STATUSES } from '../utils/constants';

const FIELDS = ['name', 'categoryId', 'organizer', 'venue', 'location', 'startDate', 'endDate', 'startTime', 'endTime', 'capacity', 'status', 'description', 'contact'];
const EMPTY = { name: '', categoryId: '', organizer: '', venue: '', location: '', startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', capacity: 100, status: 'Draft', description: '', contact: '' };

export default function EventForm({ initial, onSubmit, onCancel, submitLabel = 'Save event' }) {
  const { categories } = useData();
  const [values, setValues] = useState(() => ({
    ...Object.fromEntries(FIELDS.map((f) => [f, initial ? initial[f] ?? EMPTY[f] : EMPTY[f]])),
    id: initial?.id,
  }));
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const props = (k, label, extra = {}) => ({ label, value: values[k], onChange: set(k), error: !!errors[k], helperText: errors[k], required: true, ...extra });
  const categoryOptions = categories.filter((c) => c.status === 'Active' || c.id === Number(values.categoryId));

  const submit = (e) => {
    e.preventDefault();
    const res = onSubmit(values);
    if (res && !res.ok) setErrors(res.errors || {});
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && <Alert severity="error" sx={{ mb: 2 }}>Please correct the highlighted fields.</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}><TextField {...props('name', 'Event name')} /></Grid>
        <Grid item xs={12} sm={4}>
          <TextField select {...props('categoryId', 'Category')}>
            {categoryOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}><TextField {...props('organizer', 'Organizer')} /></Grid>
        <Grid item xs={12} sm={4}><TextField {...props('venue', 'Venue')} /></Grid>
        <Grid item xs={12} sm={4}><TextField {...props('location', 'Location')} /></Grid>
        <Grid item xs={6} sm={3}><TextField type="date" {...props('startDate', 'Start date', { InputLabelProps: { shrink: true } })} /></Grid>
        <Grid item xs={6} sm={3}><TextField type="date" {...props('endDate', 'End date', { InputLabelProps: { shrink: true } })} /></Grid>
        <Grid item xs={6} sm={3}><TextField type="time" {...props('startTime', 'Start time', { InputLabelProps: { shrink: true } })} /></Grid>
        <Grid item xs={6} sm={3}><TextField type="time" {...props('endTime', 'End time', { InputLabelProps: { shrink: true } })} /></Grid>
        <Grid item xs={6} sm={4}><TextField type="number" inputProps={{ min: 1 }} {...props('capacity', 'Capacity')} /></Grid>
        <Grid item xs={6} sm={4}>
          <TextField select {...props('status', 'Status')}>
            {EVENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}><TextField {...props('contact', 'Contact information')} /></Grid>
        <Grid item xs={12}><TextField multiline minRows={3} {...props('description', 'Description')} /></Grid>
      </Grid>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        {onCancel && <Button color="inherit" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="contained">{submitLabel}</Button>
      </Stack>
    </Box>
  );
}
