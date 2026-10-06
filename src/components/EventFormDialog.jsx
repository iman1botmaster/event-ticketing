import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import EventForm from './EventForm';
import { useData } from '../context/DataContext';

export default function EventFormDialog({ open, event, onClose }) {
  const { saveEvent } = useData();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{event ? `Edit ${event.code}` : 'Add event'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <EventForm
            initial={event}
            submitLabel={event ? 'Save changes' : 'Create event'}
            onCancel={onClose}
            onSubmit={(v) => {
              const res = saveEvent(v);
              if (res.ok) onClose();
              return res;
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
