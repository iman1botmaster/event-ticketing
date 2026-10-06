import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function ConfirmDialog({ open, title, message, confirmText = 'Confirm', confirmColor = 'primary', onConfirm, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {message && <DialogContentText>{message}</DialogContentText>}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Go back</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} autoFocus>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
