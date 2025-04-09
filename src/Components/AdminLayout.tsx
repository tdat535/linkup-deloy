import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "./Layout/Sidebar/AdminSidebar";
import AdminHeader from "./Layout/Header/AdminHeader";
import { Drawer, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";

const AdminLayout: React.FC = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-[#f0f2f586] text-black"}`}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: 240,
              backgroundColor: theme === "dark" ? "#1C1C1D" : "#f0f2f5",
              color: theme === "dark" ? "white" : "black",
              borderRight: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`
            },
          }}
        >
          <AdminSidebar />
        </Drawer>
      )}

      {/* Desktop Sidebar - only visible on desktop */}
      {!isMobile && (
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="fixed h-screen w-64">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Content area with header and main content */}
      <div className="flex-grow flex flex-col w-full md:w-[calc(100%-16rem)]">
        {/* Header at the top */}
        <AdminHeader toggleMobileSidebar={handleDrawerToggle} />
        
        {/* Main content below the header */}
        <div className="flex-grow p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;