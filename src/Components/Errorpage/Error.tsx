import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Stack,
  useTheme,
  Fade,
  Grow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';

interface ErrorPageProps {
  message?: string;
  errorCode?: string | number;
}

const Error: React.FC<ErrorPageProps> = ({ 
  message = "Có vẻ như đã có lỗi xảy ra. Vui lòng thử lại sau hoặc quay về trang chủ.",
  errorCode = "404"
}): React.ReactNode => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Hiệu ứng cho mấy cái icon
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  useEffect(() => {
    // Hiệu ứng sau khi component mount
    setIsAnimating(true);
    
    // Thiết lập thời gian cho chuyển động
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Nút thử lại
  const handleRetry = () => {
    window.location.reload();
  };

  // Nút dẫn đến trang chủ
  const handleGoHome = () => {
    navigate("/home");
  };

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
          {/* Trang trí cho background */}
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.error.light}15`,
            zIndex: 0
          }} />
          
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.primary.light}10`,
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Animation của icon error */}
            <Grow in={isAnimating} timeout={500} style={{ transformOrigin: '50% 100%' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3
              }}>
                <ErrorOutlineIcon 
                  color="error" 
                  sx={{ 
                    fontSize: { xs: 80, sm: 100 },
                    transition: 'all 0.5s ease',
                    transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
              </Box>
            </Grow>
            
            {/* Error code */}
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Mã lỗi: {errorCode}
            </Typography>
            
            {/* Tiêu đề error chính */}
            <Typography 
              variant="h4" 
              color="error.main" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
              }}
            >
              Ôi không! Đã xảy ra lỗi.
            </Typography>
            
            {/* Phần mô tả */}
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                maxWidth: '85%',
                mx: 'auto'
              }}
            >
              {message}
            </Typography>
            
            {/* Action buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button 
                variant="outlined" 
                onClick={handleRetry} 
                size="large"
                startIcon={<ReplayIcon />}
                sx={{ 
                  minWidth: 150,
                  borderRadius: 2,
                  fontWeight: 500
                }}
              >
                Thử lại
              </Button>
              
              <Button 
                variant="contained" 
                onClick={handleGoHome} 
                size="large"
                startIcon={<HomeIcon />}
                sx={{ 
                  minWidth: 150,
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  fontWeight: 500
                }}
                color="primary"
              >
                Về trang chủ
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default Error;