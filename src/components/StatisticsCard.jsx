import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';

// Card with an optional progress bar (used for occupancy / attendance percentages)
export default function StatisticsCard({ label, value, percent, helper, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ my: 0.5 }}>{value}</Typography>
        {percent !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={Math.min(percent, 100)} color={color} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}
        {helper && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>{helper}</Typography>}
      </CardContent>
    </Card>
  );
}
