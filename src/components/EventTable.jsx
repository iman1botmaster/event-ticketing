import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from './StatusChip';
import { fmtDate } from '../utils/helpers';

export default function EventTable({ rows, onEdit, onDelete }) {
  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 70, type: 'number' },
      { field: 'code', headerName: 'Event Code', width: 140 },
      { field: 'name', headerName: 'Event Name', minWidth: 230, flex: 1 },
      { field: 'categoryName', headerName: 'Category', width: 130 },
      { field: 'organizer', headerName: 'Organizer', width: 180 },
      { field: 'venue', headerName: 'Venue', width: 150 },
      { field: 'location', headerName: 'Location', width: 150 },
      { field: 'startDate', headerName: 'Start Date', width: 120, renderCell: (p) => fmtDate(p.value) },
      { field: 'endDate', headerName: 'End Date', width: 120, renderCell: (p) => fmtDate(p.value) },
      { field: 'startTime', headerName: 'Start', width: 80 },
      { field: 'endTime', headerName: 'End', width: 80 },
      { field: 'capacity', headerName: 'Capacity', width: 90, type: 'number' },
      { field: 'registered', headerName: 'Registered', width: 100, type: 'number' },
      {
        field: 'available', headerName: 'Available', width: 100, type: 'number',
        renderCell: (p) => (p.value === 0 ? <Chip size="small" color="error" label="Full" /> : p.value),
      },
      { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
      { field: 'description', headerName: 'Description', width: 260 },
      { field: 'contact', headerName: 'Contact', width: 240 },
      {
        field: 'actions', headerName: 'Actions', width: 140, sortable: false, filterable: false, disableColumnMenu: true,
        renderCell: (p) => (
          <>
            <Tooltip title="View details"><IconButton size="small" component={Link} to={`/events/${p.row.id}`} aria-label="View event"><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(p.row)} aria-label="Edit event"><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(p.row)} aria-label="Delete event"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          </>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoHeight
      disableRowSelectionOnClick
      slots={{ toolbar: GridToolbar }}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'startDate', sort: 'asc' }] },
        columns: { columnVisibilityModel: { id: false, description: false, contact: false, endTime: false } },
      }}
      pageSizeOptions={[10, 25, 50]}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
}
