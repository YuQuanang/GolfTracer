import React from 'react';
import { Typography, Container, Box, Paper, Divider } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        About Golf Ball Tracer
      </Typography>
      
      <Paper elevation={1} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          Golf Ball Tracer was created to help golfers of all skill levels visualize and analyze their ball flight patterns. 
          By providing an accessible tool that works with standard smartphone videos, we aim to democratize swing analysis 
          technology that was previously only available at high-end facilities or through expensive equipment.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" component="h2" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1" paragraph>
          Our application uses computer vision algorithms powered by OpenCV.js to track the golf ball throughout your swing video. 
          The algorithm identifies the ball based on its size, shape, and movement patterns, then traces its path frame by frame.
        </Typography>
        <Typography variant="body1" paragraph>
          For optimal results, we recommend recording videos:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1">
            With good lighting conditions
          </Typography>
          <Typography component="li" variant="body1">
            From a stable position (tripod recommended)
          </Typography>
          <Typography component="li" variant="body1">
            Perpendicular to the ball flight path
          </Typography>
          <Typography component="li" variant="body1">
            With minimal background distractions
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" component="h2" gutterBottom>
          Technology
        </Typography>
        <Typography variant="body1" paragraph>
          Golf Ball Tracer is built using modern web technologies including React, Material-UI, and OpenCV.js for computer vision processing. 
          Video processing is handled client-side, meaning your videos never leave your device, ensuring privacy and fast processing times.
        </Typography>
        <Typography variant="body1" paragraph>
          For video export functionality, we utilize FFmpeg.wasm, a WebAssembly port of FFmpeg, allowing for high-quality video rendering directly in your browser.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage;