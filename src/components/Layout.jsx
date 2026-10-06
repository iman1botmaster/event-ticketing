import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Badge, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupsIcon from '@mui/icons-material/Groups';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ConfirmDialog from './ConfirmDialog';
import { useData } from '../context/DataContext';

const NAV = [
  ['Dashboard', '/', <DashboardIcon />],
  ['Events', '/events', <EventIcon />],
  ['Event Categories', '/categories', <CategoryIcon />],
  ['Ticket Types', '/ticket-types', <ConfirmationNumberIcon />],
  ['Registration', '/registration', <HowToRegIcon />],
  ['Attendees', '/attendees', <GroupsIcon />],
  ['Tickets', '/tickets', <QrCode2Icon />],
  ['Event Statistics', '/statistics', <BarChartIcon />],
  ['Reports', '/reports', <AssessmentIcon />],
];
const WIDTH = 252;

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { pathname } = useLocation();
  const { prefs, setMode, nearCapacity, resetData } = useData();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const drawer = (
    <Box>
      <Toolbar />
      <List sx={{ px: 1.5, py: 2 }}>
        {NAV.map(([label, to, icon]) => {
          const selected = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <ListItemButton key={to} component={Link} to={to} selected={selected} onClick={() => setOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar className="layout-chrome" position="fixed" color="inherit" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          {!isDesktop && <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Open menu"><MenuIcon /></IconButton>}
          <ConfirmationNumberIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>EventHub Ticketing</Typography>
          <Tooltip title={nearCapacity.length ? `${nearCapacity.length} event(s) approaching capacity` : 'No capacity alerts'}>
            <IconButton component={Link} to="/" aria-label="Capacity alerts">
              <Badge badgeContent={nearCapacity.length} color="warning"><NotificationsIcon /></Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={prefs.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={() => setMode(prefs.mode === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{prefs.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Tooltip>
          <Tooltip title="Reset demo data"><IconButton onClick={() => setResetOpen(true)} aria-label="Reset demo data"><RestartAltIcon /></IconButton></Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" className="layout-chrome" sx={{ width: { md: WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: WIDTH } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box' } }}>{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>

      <ConfirmDialog open={resetOpen} title="Reset demo data?" message="All events, registrations and changes will be replaced by the original mock data."
        confirmText="Reset" confirmColor="error" onClose={() => setResetOpen(false)} onConfirm={() => { resetData(); setResetOpen(false); }} />
    </Box>
  );
}
