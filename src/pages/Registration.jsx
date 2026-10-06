import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import PageHeader from '../components/PageHeader';
import RegistrationForm from '../components/RegistrationForm';

export default function Registration() {
  const [params] = useSearchParams();
  const eventId = params.get('event');
  return (
    <>
      <PageHeader title="Attendee Registration" subtitle="Register an attendee and generate a ticket" />
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        <RegistrationForm key={eventId || 'none'} initialEventId={eventId ? Number(eventId) : ''} />
      </Box>
    </>
  );
}
