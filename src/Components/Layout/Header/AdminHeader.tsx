import React, { useState } from "react";
import { 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider, 
  ListItemIcon, 
  Typography, 
  Box,
  useMediaQuery,
  useTheme as useMuiTheme
} from "@mui/material";
import { LogOut, Settings, User, Menu as MenuIcon, Home } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/auth";

interface AdminHeaderProps {
  toggleMobileSidebar?: () => void; // Optional prop to control mobile sidebar
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleMobileSidebar }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("token"); // If you have a token stored
    handleClose();
    logout();
  };

  const handleProfile = () => {
    handleClose();
    navigate("/admin/profile");
  };

  const handleSettings = () => {
    handleClose();
    navigate("/admin/settings");
  };

  const handleToUser = () => {
    navigate("/home");
  };

  return (
    <header 
      className={`flex justify-between items-center px-3 py-2 md:px-4 md:py-3 border-b shadow-sm sticky top-0 z-10 ${
        theme === "dark" 
          ? "bg-[#1C1C1D] text-white border-gray-700" 
          : "bg-white text-black border-gray-200"
      }`}
    >
      <div className="flex items-center">
        {/* Mobile menu toggle button - only visible on mobile */}
        {isMobile && toggleMobileSidebar && (
          <IconButton 
            edge="start" 
            sx={{ color: theme === "dark" ? "white" : "gray" }} 
            onClick={toggleMobileSidebar}
            size="small"
          >
            <MenuIcon size={24} />
          </IconButton>
        )}
        
        {/* <Typography variant={isMobile ? "subtitle1" : "h6"} component="h1" noWrap>
          Admin Dashboard
        </Typography> */}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        
        {/* Avatar with Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar 
              sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40 
              }}
              alt="Admin User"
              src="/path-to-avatar-image.jpg" // Replace with actual avatar path
            />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: isMobile ? '100%' : 200,
                right: isMobile ? 16 : 'auto',
                left: isMobile ? 16 : 'auto',
                maxWidth: 'calc(100% - 32px)',
                backgroundColor: theme === "dark" ? "#1C1C1D" : "white",
                color: theme === "dark" ? "white" : "black",
                "& .MuiMenuItem-root": {
                  py: 1,
                  px: 2
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: "bold" }}>
                Admin User
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: theme === "dark" ? "gray" : "inherit" }}>
                admin@example.com
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1, borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "inherit" }} />
            
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <User size={18} color={theme === "dark" ? "white" : "black"} />
              </ListItemIcon>
              Tài khoản
            </MenuItem>
            
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings size={18} color={theme === "dark" ? "white" : "black"} />
              </ListItemIcon>
              Cài đặt
            </MenuItem>

            <MenuItem onClick={handleToUser}>
              <ListItemIcon>
                <Home size={18} color={theme === "dark" ? "white" : "black"} />
              </ListItemIcon>
              Tới trang user
            </MenuItem>
            
            <Divider sx={{ my: 1, borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "inherit" }} />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={18} color={theme === "dark" ? "white" : "red"} />
              </ListItemIcon>
              <Typography color={theme === "dark" ? "error" : "error"}>
                Đăng xuất
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </div>
    </header>
  );
};

export default AdminHeader;