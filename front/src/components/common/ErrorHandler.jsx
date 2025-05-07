import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Reusable error component for displaying API request errors
 * 
 * @param {Object} props Component props
 * @param {string} props.message Error message to display
 * @param {Function} props.onRetry Optional function to call when retry button is clicked
 * @param {boolean} props.showRetry Whether to show the retry button (default: true)
 * @param {string} props.severity Alert severity (default: 'error')
 * @param {Object} props.sx Additional styles
 */
const ErrorHandler = ({ 
  message, 
  onRetry, 
  showRetry = true, 
  severity = 'error',
  sx = {} 
}) => {
  return (
    <Box sx={{ mt: 2, mb: 2, ...sx }}>
      <Alert 
        severity={severity} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 1
        }}
      >
        <Typography variant="body1">{message}</Typography>
      </Alert>
      
      {showRetry && onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          size="small"
          sx={{ mt: 1 }}
        >
          Réessayer
        </Button>
      )}
    </Box>
  );
};

export default ErrorHandler; 