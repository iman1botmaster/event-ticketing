import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function DashboardCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar variant="rounded" sx={{ width: 48, height: 48, color: `${color}.main`, bgcolor: (t) => alpha(t.palette[color].main, 0.14) }}>
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" noWrap>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
