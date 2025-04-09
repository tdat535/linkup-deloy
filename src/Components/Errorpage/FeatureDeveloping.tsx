import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Stack,
  useTheme,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ConstructionIcon from '@mui/icons-material/Construction';

const FeatureDeveloping = () => {

  const navigate = useNavigate();
  const theme = useTheme();

  // Hiệu ứng xoay cho biểu tượng công cụ
  const [rotation, setRotation] = React.useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="sm" sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            borderRadius: 2, 
            textAlign: 'center',
            border: `1px solid ${theme.palette.divider}`,
            width: '100%',
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Trang trí nền */}
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.primary.light}20`,
            zIndex: 0
          }} />
          
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.secondary.light}15`,
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Biểu tượng với hiệu ứng nhẹ */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 3,
              position: 'relative'
            }}>
              <BuildCircleIcon 
                color="primary" 
                sx={{ 
                  fontSize: { xs: 80, sm: 100 },
                  opacity: 0.9
                }} 
              />
              <ConstructionIcon 
                color="secondary" 
                sx={{ 
                  fontSize: { xs: 30, sm: 40 },
                  position: 'absolute',
                  top: '60%',
                  left: '60%',
                  transform: `rotate(${rotation}deg)`,
                }} 
              />
            </Box>
            
            <Typography 
              variant="h4" 
              color="primary.main" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Tính năng đang phát triển!
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                maxWidth: '80%',
                mx: 'auto'
              }}
            >
              Chúng tôi đang làm việc để mang đến trải nghiệm tốt hơn. Hãy quay lại sau!
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)} 
                size="large"
                sx={{ 
                  minWidth: 150,
                  borderRadius: 2,
                  fontWeight: 500
                }}
                startIcon={<Box sx={{ mr: -0.5 }}>←</Box>}
              >
                Quay lại
              </Button>
              
              <Button 
                variant="contained" 
                onClick={() => navigate("/home")} 
                size="large"
                sx={{ 
                  minWidth: 150,
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  fontWeight: 500
                }}
                color="primary"
              >
                Trang chủ
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default FeatureDeveloping;