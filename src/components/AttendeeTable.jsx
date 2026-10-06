import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CancelIcon from '@mui/icons-material/Cancel';
import StatusChip from './StatusChip';
import ConfirmDialog from './ConfirmDialog';
import { useData } from '../context/DataContext';
import { fmtDate } from '../utils/helpers';

export default function AttendeeTable({ rows, hideEvent = false }) {
  const { checkIn, cancelRegistration } = useData();
  const [checking, setChecking] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const columns = useMemo(() => {
    const cols = [
      { field: 'id', headerName: 'Attendee ID', width: 100, type: 'number' },
      { field: 'regNo', headerName: 'Registration No.', width: 150 },
      { field: 'name', headerName: 'Name', minWidth: 170, flex: 1 },
      { field: 'eventName', headerName: 'Event', width: 220 },
      { field: 'ticketTypeName', headerName: 'Ticket Type', width: 120 },
      { field: 'phone', headerName: 'Phone', width: 130 },
      { field: 'email', headerName: 'Email', width: 230 },
      { field: 'registrationDate', headerName: 'Registered On', width: 130, renderCell: (p) => fmtDate(p.value) },
      { field: 'ticketNo', headerName: 'Ticket No.', width: 150 },
      { field: 'attendance', headerName: 'Attendance', width: 140, renderCell: (p) => <StatusChip status={p.value} /> },
      { field: 'registrationStatus', headerName: 'Registration', width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
      {
        field: 'actions', headerName: 'Actions', width: 140, sortable: false, filterable: false, disableColumnMenu: true,
        renderCell: (p) => {
          const canCheckIn = ['Registered', 'Not Checked In'].includes(p.row.attendance);
          const canCancel = !['Cancelled', 'Checked In'].includes(p.row.attendance);
          return (
            <>
              <Tooltip title="View attendee"><IconButton size="small" component={Link} to={`/attendees/${p.row.id}`} aria-label="View attendee"><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Check in"><span><IconButton size="small" color="success" disabled={!canCheckIn} onClick={() => setChecking(p.row)} aria-label="Check in"><HowToRegIcon fontSize="small" /></IconButton></span></Tooltip>
              <Tooltip title="Cancel registration"><span><IconButton size="small" color="error" disabled={!canCancel} onClick={() => setCancelling(p.row)} aria-label="Cancel registration"><CancelIcon fontSize="small" /></IconButton></span></Tooltip>
            </>
          );
        },
      },
    ];
    return hideEvent ? cols.filter((c) => c.field !== 'eventName') : cols;
  }, [hideEvent]);

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          columns: { columnVisibilityModel: { id: false, phone: false } },
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ bgcolor: 'background.paper' }}
      />
      <ConfirmDialog
        open={!!checking}
        title="Confirm check-in"
        message={checking ? `Check in ${checking.name} (${checking.quantity} ticket${checking.quantity > 1 ? 's' : ''}) for ${checking.eventName}?` : ''}
        confirmText="Check in"
        onClose={() => setChecking(null)}
        onConfirm={() => { checkIn(checking.id); setChecking(null); }}
      />
      <ConfirmDialog
        open={!!cancelling}
        title="Cancel registration"
        message={cancelling ? `Cancel registration ${cancelling.regNo} for ${cancelling.name}? The tickets will be released back to the event.` : ''}
        confirmText="Cancel registration"
        confirmColor="error"
        onClose={() => setCancelling(null)}
        onConfirm={() => { cancelRegistration(cancelling.id); setCancelling(null); }}
      />
    </>
  );
}
