import React from 'react';
import { Box, Typography, Paper, Grid, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

const TracerControls = ({ tracerSettings, onSettingChange }) => {
  const handleColorChange = (color) => {
    onSettingChange('color', color);
  };
  
  const handleWidthChange = (event, newValue) => {
    onSettingChange('width', newValue);
  };
  
  const handleOpacityChange = (event, newValue) => {
    onSettingChange('opacity', newValue);
  };
  
  const handleStyleChange = (event) => {
    onSettingChange('style', event.target.value);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customize Tracer
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Color</Typography>
            <Box sx={{ mb: 2 }}>
              <HexColorPicker color={tracerSettings.color} onChange={handleColorChange} style={{ width: '100%' }} />
            </Box>
            
            <Typography gutterBottom>Line Width: {tracerSettings.width}px</Typography>
            <Slider
              value={tracerSettings.width}
              onChange={handleWidthChange}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom>Opacity: {Math.round(tracerSettings.opacity * 100)}%</Typography>
            <Slider
              value={tracerSettings.opacity}
              onChange={handleOpacityChange}
              min={0.1}
              max={1}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="tracer-style-label">Line Style</InputLabel>
              <Select
                labelId="tracer-style-label"
                id="tracer-style"
                value={tracerSettings.style}
                label="Line Style"
                onChange={handleStyleChange}
              >
                <MenuItem value="solid">Solid</MenuItem>
                <MenuItem value="dashed">Dashed</MenuItem>
                <MenuItem value="dotted">Dotted</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 4, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  backgroundColor: tracerSettings.color,
                  opacity: tracerSettings.opacity,
                  borderRadius: 1,
                  my: 2,
                  ...(tracerSettings.style === 'dashed' && {
                    backgroundImage: `repeating-linear-gradient(to right, ${tracerSettings.color} 0, ${tracerSettings.color} 10px, transparent 10px, transparent 15px)`,
                  }),
                  ...(tracerSettings.style === 'dotted' && {
                    backgroundImage: `repeating-linear-gradient(to right, ${tracerSettings.color} 0, ${tracerSettings.color} 5px, transparent 5px, transparent 10px)`,
                  }),
                }}
              />
              <Box
                sx={{
                  height: tracerSettings.width * 2,
                  width: '100%',
                  backgroundColor: tracerSettings.color,
                  opacity: tracerSettings.opacity,
                  borderRadius: tracerSettings.width,
                  ...(tracerSettings.style === 'dashed' && {
                    backgroundImage: `repeating-linear-gradient(to right, ${tracerSettings.color} 0, ${tracerSettings.color} 10px, transparent 10px, transparent 15px)`,
                  }),
                  ...(tracerSettings.style === 'dotted' && {
                    backgroundImage: `repeating-linear-gradient(to right, ${tracerSettings.color} 0, ${tracerSettings.color} 5px, transparent 5px, transparent 10px)`,
                  }),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TracerControls;