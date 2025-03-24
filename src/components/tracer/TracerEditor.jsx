import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Slider, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

const TracerEditor = ({ 
  videoRef, 
  canvasRef, 
  tracerPoints, 
  updateTracerPoint, 
  addTracerPoint, 
  removeTracerPoint 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState(-1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorCanvasRef = useRef(null);
  // Initialize history with current points
  useEffect(() => {
    if (tracerPoints.length > 0 && history.length === 0) {
      setHistory([tracerPoints]);
      setHistoryIndex(0);
    }
  }, [tracerPoints, history]);
  
  // Update editor canvas when video frame changes or when editing mode changes
  useEffect(() => {
    if (videoRef?.current && editorCanvasRef.current) {
      drawEditorCanvas();
    }
  }, [currentFrame, isEditing, selectedPointIndex, tracerPoints]);
  
  // Handle video time update
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      const newFrame = Math.floor(video.currentTime * 30); // Assuming 30fps
      setCurrentFrame(newFrame);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef]);
  
  // Draw editor canvas
  const drawEditorCanvas = () => {
    const canvas = editorCanvasRef.current;
    const video = videoRef?.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isEditing) return;
    
    // Draw all points
    tracerPoints.forEach((point, index) => {
      const isSelected = index === selectedPointIndex;
      const isCurrentFramePoint = point.frame === currentFrame;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, isSelected ? 8 : 6, 0, Math.PI * 2);
      
      if (isSelected) {
        ctx.fillStyle = '#2196F3';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
      } else if (isCurrentFramePoint) {
        ctx.fillStyle = '#4CAF50';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
      }
      
      ctx.fill();
      ctx.stroke();
      
      // Draw frame number
      if (isSelected || isCurrentFramePoint) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`Frame: ${point.frame}`, point.x + 10, point.y - 10);
        ctx.fillText(`Frame: ${point.frame}`, point.x + 10, point.y - 10);
      }
    });
  };
  
  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (!isEditing) return;
    
    const canvas = editorCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicked on an existing point
    let clickedPointIndex = -1;
    for (let i = 0; i < tracerPoints.length; i++) {
      const point = tracerPoints[i];
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      
      if (distance < 15) { // 15px radius for selection
        clickedPointIndex = i;
        break;
      }
    }
    
    if (clickedPointIndex >= 0) {
      // Select existing point
      setSelectedPointIndex(clickedPointIndex);
      
      // Set video to the frame of the selected point
      if (videoRef?.current) {
        videoRef.current.currentTime = tracerPoints[clickedPointIndex].frame / 30; // Assuming 30fps
      }
    } else if (selectedPointIndex >= 0) {
      // Update selected point position
      const updatedPoint = { ...tracerPoints[selectedPointIndex], x, y };
      updateTracerPoint(selectedPointIndex, updatedPoint);
      
      // Add to history - create a new array with the updated point
      const updatedPoints = [...tracerPoints];
      updatedPoints[selectedPointIndex] = updatedPoint;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedPoints);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      // Add new point at current frame
      const newPoint = { x, y, frame: currentFrame };
      addTracerPoint(newPoint);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...tracerPoints, newPoint]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing);
    setSelectedPointIndex(-1);
  };
  
  // Add new point at current frame
  const handleAddPoint = () => {
    if (!videoRef?.current) return;
    
    const video = videoRef.current;
    const canvas = editorCanvasRef.current;
    
    if (!canvas) return;
    
    // Add point at center of video
    const x = video.videoWidth / 2;
    const y = video.videoHeight / 2;
    const frame = Math.floor(video.currentTime * 30); // Assuming 30fps
    
    const newPoint = { x, y, frame };
    addTracerPoint(newPoint);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    const updatedPoints = [...tracerPoints, newPoint];
    newHistory.push(updatedPoints);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Select the new point
    setSelectedPointIndex(tracerPoints.length);
  };
  
  // Remove selected point
  const handleRemovePoint = () => {
    if (selectedPointIndex < 0) return;
    
    removeTracerPoint(selectedPointIndex);
    
    // Add to history
    const newPoints = tracerPoints.filter((_, i) => i !== selectedPointIndex);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPoints);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setSelectedPointIndex(-1);
  };
  
  // Undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const previousPoints = history[newIndex];
    
    // Update points
    // This is a bit of a hack to update the parent's state
    // Ideally, we would use a more robust state management solution
    const currentPoints = [...tracerPoints];
    currentPoints.forEach((_, i) => removeTracerPoint(0)); // Remove all points
    previousPoints.forEach(point => addTracerPoint(point)); // Add previous points
    
    setHistoryIndex(newIndex);
    setSelectedPointIndex(-1);
  };
  
  // Redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const nextPoints = history[newIndex];
    
    // Update points
    const currentPoints = [...tracerPoints];
    currentPoints.forEach((_, i) => removeTracerPoint(0)); // Remove all points
    nextPoints.forEach(point => addTracerPoint(point)); // Add next points
    
    setHistoryIndex(newIndex);
    setSelectedPointIndex(-1);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Edit Tracer Path
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant={isEditing ? "contained" : "outlined"}
            color="primary"
            startIcon={<EditIcon />}
            onClick={toggleEditing}
            sx={{ mr: 1 }}
          >
            {isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
          </Button>
          
          {isEditing && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddPoint}
                sx={{ mr: 1 }}
              >
                Add Point
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<RemoveCircleOutlineIcon />}
                onClick={handleRemovePoint}
                disabled={selectedPointIndex < 0}
                sx={{ mr: 1 }}
              >
                Remove Point
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                sx={{ mr: 1 }}
              >
                Undo
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RedoIcon />}
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                Redo
              </Button>
            </>
          )}
        </Box>
        
        {isEditing && (
          <Typography variant="body2" color="text.secondary" paragraph>
            Click on a point to select it, then click elsewhere to move it. Or add new points with the Add Point button.
          </Typography>
        )}
        
        <Box sx={{ position: 'relative' }}>
          {videoRef?.current && (
            <Box
              component="canvas"
              ref={editorCanvasRef}
              onClick={handleCanvasClick}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: isEditing ? 2 : 0,
                cursor: isEditing ? 'pointer' : 'default',
              }}
            />
          )}
        </Box>
        
        {selectedPointIndex >= 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Selected Point: Frame {tracerPoints[selectedPointIndex].frame}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Position: ({Math.round(tracerPoints[selectedPointIndex].x)}, {Math.round(tracerPoints[selectedPointIndex].y)})
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}; // Add this closing brace and semicolon

export default TracerEditor;