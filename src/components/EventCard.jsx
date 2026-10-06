import { Link } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StatusChip from './StatusChip';
import { fmtDate } from '../utils/helpers';

export default function EventCard({ event }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: 4, borderTopColor: 'primary.main' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Chip size="small" variant="outlined" label={event.categoryName} />
          <StatusChip status={event.status} />
        </Stack>
        <Typography variant="h6" sx={{ lineHeight: 1.25, mb: 1 }}>{event.name}</Typography>
        <Stack spacing={0.5} sx={{ color: 'text.secondary', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center"><CalendarMonthIcon fontSize="small" /><Typography variant="body2">{fmtDate(event.startDate)} · {event.startTime}</Typography></Stack>
          <Stack direction="row" spacing={1} alignItems="center"><PlaceIcon fontSize="small" /><Typography variant="body2">{event.venue}, {event.location}</Typography></Stack>
        </Stack>
        <Box>
          <Stack direction="row" justifyContent="space-between"><Typography variant="caption">{event.registered} / {event.capacity} seats</Typography><Typography variant="caption">{event.occupancy}%</Typography></Stack>
          <LinearProgress variant="determinate" value={Math.min(event.occupancy, 100)} color={event.occupancy >= 80 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/events/${event.id}`}>View details</Button>
      </CardActions>
    </Card>
  );
}
