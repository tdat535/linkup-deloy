import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRoutes from './routes/routes';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext'; // 👈 thêm dòng này

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('accessToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider>
      <SocketProvider> {/* 👈 Bao quanh toàn bộ app */}
        <Router>
          <AppRoutes token={token} />
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;
