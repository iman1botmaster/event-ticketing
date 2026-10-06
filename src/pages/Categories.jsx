import { useMemo, useState } from 'react';
import {
  Alert, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { useData } from '../context/DataContext';

function CategoryDialog({ category, onClose }) {
  const { saveCategory } = useData();
  const [v, setV] = useState({ id: category?.id, name: category?.name || '', description: category?.description || '' });
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const res = saveCategory(v);
    if (res.ok) onClose();
    else setErrors(res.errors);
  };
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <TextField label="Category name" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={!!errors.name} helperText={errors.name} autoFocus />
        <TextField label="Description" multiline minRows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Categories() {
  const { categories, toggleCategory, deleteCategory } = useData();
  const [q, setQ] = useState('');
  const [dialog, setDialog] = useState({ open: false, category: null });
  const [removing, setRemoving] = useState(null);
  const rows = useMemo(() => categories.filter((c) => `${c.name} ${c.description}`.toLowerCase().includes(q.trim().toLowerCase())), [categories, q]);

  return (
    <>
      <PageHeader title="Event Categories" subtitle={`${categories.length} categories`}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, category: null })}>Add category</Button>} />
      <Card sx={{ p: 2, mb: 2 }}>
        <TextField placeholder="Search categories…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ maxWidth: 360 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search categories' }} />
      </Card>
      {rows.length === 0 ? <Alert severity="info">No categories found.</Alert> : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Category</TableCell><TableCell>Description</TableCell><TableCell align="right">Events</TableCell><TableCell>Status</TableCell><TableCell align="center">Active</TableCell><TableCell align="right">Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell align="right">{c.eventCount}</TableCell>
                    <TableCell><StatusChip status={c.status} /></TableCell>
                    <TableCell align="center"><Switch checked={c.status === 'Active'} onChange={() => toggleCategory(c.id)} inputProps={{ 'aria-label': `Toggle ${c.name}` }} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => setDialog({ open: true, category: c })} aria-label="Edit category"><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setRemoving(c)} aria-label="Delete category"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
      {dialog.open && <CategoryDialog category={dialog.category} onClose={() => setDialog({ open: false, category: null })} />}
      <ConfirmDialog open={!!removing} title="Delete category?" message={removing ? `Delete "${removing.name}"? Categories used by events cannot be deleted.` : ''}
        confirmText="Delete" confirmColor="error" onClose={() => setRemoving(null)} onConfirm={() => { deleteCategory(removing.id); setRemoving(null); }} />
    </>
  );
}
