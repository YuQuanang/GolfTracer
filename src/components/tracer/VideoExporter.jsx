import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoExporter = ({ videoFile, videoUrl, tracerPoints, tracerSettings }) => {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('traced_golf_swing');
  
  // Initialize FFmpeg
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        
        const ffmpegInstance = new FFmpeg();
        
        // Log progress
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });
        
        // Load FFmpeg core
        await ffmpegInstance.load({
          coreURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js',
            'application/javascript'
          ),
          wasmURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.wasm',
            'application/wasm'
          ),
        });
        
        setFfmpeg(ffmpegInstance);
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        setError(`Error initializing FFmpeg: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    load();
    
    // Cleanup
    return () => {
      if (exportedUrl) {
        URL.revokeObjectURL(exportedUrl);
      }
    };
  }, []);
  
  // Export video with tracer
  const exportVideo = async () => {
    if (!ffmpeg || !videoFile || tracerPoints.length === 0) return;
    
    try {
      setIsLoading(true);
      setProgress(0);
      setError('');
      
      // Write input video to memory
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      // Generate SVG overlay with tracer path
      const svgOverlay = generateSvgOverlay();
      await ffmpeg.writeFile('overlay.svg', svgOverlay);
      
      // Get video dimensions
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-hide_banner',
        '-loglevel', 'error',
      ]);
      
      // Combine video with SVG overlay
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'overlay.svg',
        '-filter_complex', '[0:v][1:v]overlay=0:0',
        '-c:a', 'copy',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        'output.mp4'
      ]);
      
      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');
      
      // Create a URL for the output video
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      setExportedUrl(url);
      setIsLoading(false);
    } catch (err) {
      setError(`Error exporting video: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  // Generate SVG overlay with tracer path
  const generateSvgOverlay = () => {
    // This is a simplified version - in a real implementation,
    // you would need to calculate the SVG dimensions based on the video dimensions
    const width = 1280; // Placeholder - should be actual video width
    const height = 720; // Placeholder - should be actual video height
    
    // Start SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    
    // Add tracer path
    if (tracerPoints.length > 1) {
      // Path
      svg += `<path d="M ${tracerPoints[0].x} ${tracerPoints[0].y}`;
      
      for (let i = 1; i < tracerPoints.length; i++) {
        svg += ` L ${tracerPoints[i].x} ${tracerPoints[i].y}`;
      }
      
      svg += `" fill="none" stroke="${tracerSettings.color}" stroke-width="${tracerSettings.width}" `;
      svg += `stroke-opacity="${tracerSettings.opacity}" `;
      
      if (tracerSettings.style === 'dashed') {
        svg += `stroke-dasharray="5,3" `;
      } else if (tracerSettings.style === 'dotted') {
        svg += `stroke-dasharray="2,2" `;
      }
      
      svg += `/>`;
      
      // Points
      tracerPoints.forEach(point => {
        svg += `<circle cx="${point.x}" cy="${point.y}" r="${tracerSettings.width + 1}" `;
        svg += `fill="${tracerSettings.color}" fill-opacity="${tracerSettings.opacity}" />`;
      });
    }
    
    // Close SVG
    svg += '</svg>';
    
    return svg;
  };
  
  // Download exported video
  const downloadVideo = () => {
    if (!exportedUrl) return;
    
    const a = document.createElement('a');
    a.href = exportedUrl;
    a.download = `${fileName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Video with Tracer
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="File Name"
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
        </Box>
        
        {!isReady && !error && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Initializing video processor...
            </Typography>
          </Box>
        )}
        
        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
            <CircularProgress variant="determinate" value={progress} size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Exporting Video: {progress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few minutes depending on video length and quality.
            </Typography>
          </Box>
        )}
        
        {!isLoading && isReady && !exportedUrl && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={exportVideo}
            size="large"
            fullWidth
            sx={{ py: 1.5 }}
          >
            Export Video with Tracer
          </Button>
        )}
        
        {exportedUrl && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <video 
                src={exportedUrl} 
                controls 
                style={{ width: '100%', borderRadius: '8px' }} 
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={downloadVideo}
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Download Video
            </Button>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default VideoExporter;