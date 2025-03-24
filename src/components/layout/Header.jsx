import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <SportsGolfIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
              Golf Ball Tracer
            </Typography>
          </Box>
          <Box>
            <Button 
              component={Link} 
              to="/" 
              color="inherit" 
              sx={{ fontWeight: isActive('/') ? 'bold' : 'normal' }}
            >
              Home
            </Button>
            <Button 
              component={Link} 
              to="/tracer" 
              color="inherit"
              sx={{ fontWeight: isActive('/tracer') ? 'bold' : 'normal' }}
            >
              Tracer Tool
            </Button>
            <Button 
              component={Link} 
              to="/about" 
              color="inherit"
              sx={{ fontWeight: isActive('/about') ? 'bold' : 'normal' }}
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;