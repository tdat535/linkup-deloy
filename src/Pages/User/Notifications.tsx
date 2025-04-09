import React, { useEffect, useState } from 'react';
import Notification from '../../Components/Layout/Noti/Noti';
const Notifications: React.FC = () => {
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div  className={isMobile ? 'mt-20' : ''}>
      <Notification />
    </div>
  );
};

export default Notifications;