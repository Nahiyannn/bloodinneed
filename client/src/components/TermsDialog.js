import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

function TermsDialog({ open, onClose, onAccept, title }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" paragraph>
          By proceeding, you agree to the following terms:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            Your contact information will be visible to other users seeking blood donors.
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            You consent to being contacted by potential blood recipients or their representatives.
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            You confirm that all provided information is accurate and up to date.
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            You understand that this platform is for humanitarian purposes and should not be misused.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onAccept} variant="contained" color="primary">
          I Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TermsDialog;
