import { Box, Card, CardContent, Typography } from '@mui/material';

export default function ChartCard({ title, subtitle, empty, height = 300, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        <Box sx={{ height, mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {empty ? <Typography color="text.secondary">No data to display yet</Typography> : <Box sx={{ width: '100%', height: '100%' }}>{children}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
}
