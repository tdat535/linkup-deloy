import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useTheme } from '../context/ThemeContext';
import FollowSidebar from './Layout/FollowSidebar/FollowSidebar';
import Sidebar from './Layout/Sidebar/Sidebar';

const UserLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const hideFollowSidebar = location.pathname === "/home/messages";

  return (
    <div className={`min-h-screen  flex ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-[#f0f2f586] text-black"}`}>
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Nội dung chính */}
      <main className={`flex-1 md:ml-64 ${hideFollowSidebar ? "md:mr-0" : "md:mr-64"}`}>
        <Outlet /> {/* Đây là nơi các trang sẽ hiển thị */}
      </main>

      {/* Sidebar bên phải (ẩn khi ở trang /messages) */}
      {!hideFollowSidebar && <FollowSidebar />}
    </div>
  );
};

export default UserLayout;
