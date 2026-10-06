import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../components/PageHeader';
import EventForm from '../components/EventForm';
import { useData } from '../context/DataContext';

export default function EventFormPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, saveEvent } = useData();
  const event = eventId ? events.find((e) => e.id === Number(eventId)) : null;

  if (eventId && !event) return <Alert severity="error" action={<Button component={Link} to="/events">Back</Button>}>Event not found.</Alert>;

  return (
    <>
      <PageHeader
        title={event ? `Edit event – ${event.code}` : 'Create event'}
        subtitle={event ? event.name : 'Create a new event, then add ticket types and publish it'}
        actions={<Button startIcon={<ArrowBackIcon />} component={Link} to={event ? `/events/${event.id}` : '/events'}>Back</Button>}
      />
      <Card sx={{ maxWidth: 900 }}>
        <CardContent>
          <EventForm
            key={event ? event.id : 'new'}
            initial={event}
            submitLabel={event ? 'Save changes' : 'Create event'}
            onCancel={() => navigate(-1)}
            onSubmit={(v) => {
              const res = saveEvent(v);
              if (res.ok) navigate(`/events/${res.event.id ?? event.id}`);
              return res;
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
