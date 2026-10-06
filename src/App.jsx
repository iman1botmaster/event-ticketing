import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Alert, Box, CircularProgress, CssBaseline, Snackbar, ThemeProvider, Typography } from '@mui/material';
import { DataProvider, useData } from './context/DataContext';
import { buildTheme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventFormPage from './pages/EventFormPage';
import Categories from './pages/Categories';
import TicketTypes from './pages/TicketTypes';
import Registration from './pages/Registration';
import Attendees from './pages/Attendees';
import AttendeeDetails from './pages/AttendeeDetails';
import Tickets from './pages/Tickets';
import Statistics from './pages/Statistics';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function Shell() {
  const { prefs, loading, toast, closeToast } = useData();
  const theme = useMemo(() => buildTheme(prefs.mode), [prefs.mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loading ? (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading events…</Typography>
        </Box>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/new" element={<EventFormPage />} />
            <Route path="events/:eventId" element={<EventDetails />} />
            <Route path="events/:eventId/edit" element={<EventFormPage />} />
            <Route path="categories" element={<Categories />} />
            <Route path="ticket-types" element={<TicketTypes />} />
            <Route path="registration" element={<Registration />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="attendees/:attendeeId" element={<AttendeeDetails />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      )}
      <Snackbar open={toast.open} autoHideDuration={4500} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}
