import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Box, Paper, Grid, Container } from '@mui/material';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="center" mb={2}>
        {icon}
      </Box>
      <Typography variant="h5" component="h3" gutterBottom align="center">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        {description}
      </Typography>
    </Paper>
  );
};

const HomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" gutterBottom>
          Analyze Your Golf Swing with Precision
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Upload your golf swing videos and get instant ball flight tracing.
          Edit, analyze, and share your traced videos with ease.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          component={RouterLink} 
          to="/tracer"
          sx={{ mt: 4 }}
        >
          Try It Now
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <FeatureCard 
            icon={<MovieFilterIcon color="primary" sx={{ fontSize: 60 }} />}
            title="Upload & Trace"
            description="Upload your golf swing videos and our algorithm will automatically trace the ball flight path."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard 
            icon={<EditIcon color="primary" sx={{ fontSize: 60 }} />}
            title="Edit & Customize"
            description="Fine-tune the traced path if needed with our intuitive editor. Adjust colors and styles to your preference."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard 
            icon={<SaveIcon color="primary" sx={{ fontSize: 60 }} />}
            title="Save & Share"
            description="Download your traced video in high quality and share it with friends, coaches, or on social media."
          />
        </Grid>
      </Grid>

      <Box textAlign="center" mt={8}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to analyze your golf swing?
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large" 
          component={RouterLink} 
          to="/tracer"
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;