import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MovieIcon from '@mui/icons-material/Movie';

const VideoUploader = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndUpload(file);
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };
  
  // Validate file and call onFileUpload
  const validateAndUpload = (file) => {
    setError('');
    
    // Check if file exists
    if (!file) {
      setError('No file selected');
      return;
    }
    
    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, WebM, MOV, or AVI)');
      return;
    }
    
    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      setError('File size exceeds 100MB limit');
      return;
    }
    
    // Call the onFileUpload callback
    onFileUpload(file);
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    inputRef.current.click();
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragActive ? 'primary.main' : 'divider',
          backgroundColor: dragActive ? 'rgba(76, 175, 80, 0.08)' : 'background.paper',
          transition: 'all 0.3s ease',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <MovieIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Upload Golf Swing Video
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Drag and drop your video file here, or click the button below to select a file.
          For best results, use videos with good lighting and a clear view of the ball flight.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={onButtonClick}
          size="large"
          sx={{ mt: 2 }}
        >
          Select Video
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Supported formats: MP4, WebM, MOV, AVI (Max size: 100MB)
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default VideoUploader;