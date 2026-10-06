import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import ChartCard from './ChartCard';
import { CHART_COLORS } from '../utils/constants';
import { buildMonthly } from '../utils/derive';
import { groupBy, short } from '../utils/helpers';

// All charts are computed from live application data, so they update when the data changes.
function Axes({ angle = true }) {
  const theme = useTheme();
  const tick = { fontSize: 11, fill: theme.palette.text.secondary };
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
      <XAxis dataKey="name" tick={tick} interval={0} angle={angle ? -30 : 0} textAnchor={angle ? 'end' : 'middle'} height={angle ? 70 : 30} />
      <YAxis tick={tick} allowDecimals={false} />
      <Tooltip />
      <Legend verticalAlign="top" height={28} />
    </>
  );
}

const top = (events, key, n = 8) =>
  [...events].sort((a, b) => b[key] - a[key]).slice(0, n).map((e) => ({ ...e, name: short(e.name) }));

export function RegistrationsByEventChart({ events }) {
  const data = useMemo(() => top(events.filter((e) => e.registrationCount > 0), 'registrationCount'), [events]);
  return (
    <ChartCard title="Registrations by Event" subtitle="Active registrations per event (top 8)" empty={!data.length}>
      <ResponsiveContainer>
        <BarChart data={data}><Axes /><Bar dataKey="registrationCount" name="Registrations" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TicketSalesChart({ events }) {
  const data = useMemo(() => top(events.filter((e) => e.ticketsSold > 0), 'ticketsSold'), [events]);
  return (
    <ChartCard title="Ticket Sales" subtitle="Tickets sold vs seats still available" empty={!data.length}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <Axes />
          <Bar dataKey="ticketsSold" name="Sold" stackId="a" fill={CHART_COLORS[0]} />
          <Bar dataKey="available" name="Available" stackId="a" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AttendanceChart({ events }) {
  const data = useMemo(() => top(events.filter((e) => e.registered > 0), 'registered'), [events]);
  return (
    <ChartCard title="Attendance Statistics" subtitle="Registered vs checked-in attendees" empty={!data.length}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <Axes />
          <Bar dataKey="registered" name="Registered" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="checkedIn" name="Checked In" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyTrendChart({ attendees }) {
  const data = useMemo(() => buildMonthly(attendees).map((m) => ({ ...m, name: m.label })), [attendees]);
  return (
    <ChartCard title="Monthly Registration Trend" subtitle="Registrations and tickets per month" empty={!data.length}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Axes angle={false} />
          <Line type="monotone" dataKey="registrations" name="Registrations" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot />
          <Line type="monotone" dataKey="tickets" name="Tickets" stroke={CHART_COLORS[1]} strokeWidth={2.5} dot />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function PieCard({ title, subtitle, data }) {
  return (
    <ChartCard title={title} subtitle={subtitle} empty={!data.length}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2} label={(d) => d.value}>
            {data.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TicketTypeSalesChart({ ticketTypes }) {
  const data = useMemo(
    () => Object.entries(groupBy(ticketTypes, (t) => t.name)).map(([name, list]) => ({ name, value: list.reduce((s, t) => s + t.sold, 0) })).filter((d) => d.value > 0),
    [ticketTypes]
  );
  return <PieCard title="Ticket Sales by Ticket Type" subtitle="Tickets sold per ticket type" data={data} />;
}

export function StatusPieChart({ events }) {
  const data = useMemo(() => Object.entries(groupBy(events, (e) => e.status)).map(([name, list]) => ({ name, value: list.length })), [events]);
  return <PieCard title="Event Status Distribution" subtitle="Number of events per status" data={data} />;
}

export function CategoryChart({ events }) {
  const data = useMemo(() => Object.entries(groupBy(events, (e) => e.categoryName)).map(([name, list]) => ({ name, events: list.length })), [events]);
  return (
    <ChartCard title="Events by Category" empty={!data.length}>
      <ResponsiveContainer><BarChart data={data}><Axes /><Bar dataKey="events" name="Events" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
  );
}

export function OccupancyChart({ events }) {
  const data = useMemo(() => top(events.filter((e) => e.registered > 0), 'occupancy', 10), [events]);
  return (
    <ChartCard title="Event Occupancy Rate" subtitle="Registered ÷ capacity (%)" empty={!data.length}>
      <ResponsiveContainer><BarChart data={data}><Axes /><Bar dataKey="occupancy" name="Occupancy %" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
  );
}
