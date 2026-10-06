import { Link } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Alert severity="warning" action={<Button component={Link} to="/" size="small">Dashboard</Button>}>The page you are looking for does not exist.</Alert>
    </>
  );
}
