import React, { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Box, IconButton, Slider, Paper, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const VideoPlayer = forwardRef((props, ref) => {
  const { videoUrl, tracerPoints = [], tracerSettings = {} } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(null);
  // Expose video element methods to parent component
  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current.play();
      setIsPlaying(true);
    },
    pause: () => {
      videoRef.current.pause();
      setIsPlaying(false);
    },
    getCurrentTime: () => videoRef.current.currentTime,
    getDuration: () => videoRef.current.duration,
    seekTo: (time) => {
      videoRef.current.currentTime = time;
    },
    getVideoElement: () => videoRef.current,
    getCanvasElement: () => canvasRef.current,
  }));
  
  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      drawTracer();
    };
    
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Update tracer when points or settings change
  useEffect(() => {
    drawTracer();
  }, [tracerPoints, tracerSettings]);
  
  // Draw tracer on canvas
  const drawTracer = () => {
    if (!canvasRef.current || !videoRef.current || tracerPoints.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current frame
    const currentFrame = Math.floor(video.currentTime * 30); // Assuming 30fps
    
    // Set tracer style
    const color = tracerSettings.color || '#ff0000';
    const width = tracerSettings.width || 3;
    const opacity = tracerSettings.opacity || 0.8;
    const style = tracerSettings.style || 'solid';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = opacity;
    
    if (style === 'dashed') {
      ctx.setLineDash([5, 3]);
    } else {
      ctx.setLineDash([]);
    }
    
    // Draw tracer path up to current frame
    const visiblePoints = tracerPoints.filter(point => point.frame <= currentFrame);
    
    if (visiblePoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      
      for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
      }
      
      ctx.stroke();
      
      // Draw points
      visiblePoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, width + 1, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    }
  };
  
  // Playback controls
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (_, newValue) => {
    videoRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };
  
  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
    videoRef.current.volume = newValue;
    setIsMuted(newValue === 0);
  };
  
  const toggleMute = () => {
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };
  
  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Box id="video-container"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover .video-controls': {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{
            width: '100%',
            display: 'block',
            borderRadius: '8px',
          }}
          muted={isMuted}
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </Box>
      
      <Box
        className="video-controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(76, 175, 80, 0.16)',
              },
            },
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={togglePlay} size="small" sx={{ color: 'white' }}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, width: 100 }}>
              <IconButton onClick={toggleMute} size="small" sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{
                  color: 'white',
                  width: 60,
                  ml: 1,
                  '& .MuiSlider-track': {
                    border: 'none',
                  },
                  '& .MuiSlider-thumb': {
                    width: 10,
                    height: 10,
                    backgroundColor: '#fff',
                  },
                }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ color: 'white', ml: 1 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleFullscreen} size="small" sx={{ color: 'white' }}>
              <FullscreenIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default VideoPlayer;