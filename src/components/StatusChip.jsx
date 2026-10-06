import { Chip } from '@mui/material';

const COLORS = {
  Draft: 'default', Published: 'info', Upcoming: 'primary', Ongoing: 'success', Completed: 'default', Cancelled: 'error',
  Registered: 'info', 'Checked In': 'success', 'Not Checked In': 'warning',
  Confirmed: 'success', Reserved: 'warning', Used: 'secondary',
  Active: 'success', Inactive: 'default', 'Sold Out': 'error',
  Paid: 'success', Pending: 'warning', Refunded: 'error',
};

export default function StatusChip({ status, size = 'small' }) {
  return <Chip size={size} label={status} color={COLORS[status] || 'default'} variant={status === 'Completed' ? 'outlined' : 'filled'} />;
}
