import { useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../../../context/ThemeContext";
import List from "@mui/material/List";
import { Collapse, ListItemText } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import React from "react";

// Import icons
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SettingsIcon from '@mui/icons-material/Settings';
import SunnyIcon from '@mui/icons-material/Sunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';

const AdminSidebar = () => {
  const { theme, toggleTheme } = useTheme(); 
  const currentUserId = localStorage.getItem("currentUserId") || "default-id";
  
  // State để theo dõi xem cái nào sẽ mở trước
  const [openMenu, setOpenMenu] = useState<string | null>("users"); // Người dùng sẽ mở bật đầu tiên

  // Đảm bảo rằng từng menu sẽ nảy ra chứ không phải tất cả
  const handleMenuToggle = (menuId: string) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  return (
    <div className={`h-full w-full flex flex-col transition-all border-r duration-300 ${theme === "dark" ? "bg-[#1C1C1D] text-white border-gray-700" : "bg-[#f0f2f5] text-black"}`}>
      <h1 className="text-4xl font-bold mb-6 p-4 text-center">𝓛𝓲𝓷𝓴𝓤𝓹</h1>

      <List
        sx={{ 
          width: '100%', 
          maxWidth: 360,
          '& .MuiListItemButton-root': {
            transition: 'all 0.2s ease-in-out',
            borderRadius: '8px',
            margin: '4px 8px',
            '&:hover': {
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              transform: 'translateX(5px)'
            }
          },
          '& .MuiListItemIcon-root': {
            color: theme === 'dark' ? '#90caf9' : '#1976d2'
          }
        }}
        component={"nav"}
        aria-labelledby="sidebar-list"
      > 
        <Link to="/admin">
          <ListItemButton sx={{
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.08)'
          }}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ 
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}
            />
          </ListItemButton>
        </Link>

        {/* Menu Người dùng */}
        <ListItemButton 
          onClick={() => handleMenuToggle('users')}
          sx={{
            backgroundColor: openMenu === 'users' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
            marginTop: '10px'
          }}
        >
          <ListItemIcon>
            <PeopleAltIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Người dùng" 
            primaryTypographyProps={{ 
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: openMenu === 'users' ? (theme === 'dark' ? '#90caf9' : '#1976d2') : 'inherit'
            }}
          />
          {openMenu === 'users' ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenu === 'users'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/admin/users-list">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Danh sách người dùng" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>

          </List>
        </Collapse>

        {/* Menu Nội dung */}
        <ListItemButton 
          onClick={() => handleMenuToggle('content')}
          sx={{
            backgroundColor: openMenu === 'content' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
            marginTop: '10px'
          }}
        >
          <ListItemIcon>
            <DynamicFeedIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Nội dung" 
            primaryTypographyProps={{ 
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: openMenu === 'content' ? (theme === 'dark' ? '#90caf9' : '#1976d2') : 'inherit'
            }}
          />
          {openMenu === 'content' ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenu === 'content'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/admin/posts-list">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Quản lý bài viết" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>

            <Link to="/admin/comments-list">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Quản lý bình luận" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>

            <Link to="/admin/report-list">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Báo cáo từ người dùng" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
        
        {/* Menu Tương tác */}
        <ListItemButton 
          onClick={() => handleMenuToggle('interaction')}
          sx={{
            backgroundColor: openMenu === 'interaction' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
            marginTop: '10px'
          }}
        >
          <ListItemIcon>
            <FavoriteBorderIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Tương tác" 
            primaryTypographyProps={{ 
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: openMenu === 'interaction' ? (theme === 'dark' ? '#90caf9' : '#1976d2') : 'inherit'
            }}
          />
          {openMenu === 'interaction' ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenu === 'interaction'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/developing">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Quản lý tin nhắn" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>

            <Link to="/developing">
              <ListItemButton>
                <ListItemText 
                  inset 
                  primary="Quản lý thông báo" 
                  sx={{ pl: 2 }}
                />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>

        {/* Menu Hệ thống */}
        <ListItemButton
          onClick={() => handleMenuToggle('system')}
          sx={{
            backgroundColor: openMenu === 'system' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
            marginTop: '10px'
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Hệ thống" 
            primaryTypographyProps={{ 
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: openMenu === 'system' ? (theme === 'dark' ? '#90caf9' : '#1976d2') : 'inherit'
            }}
          />
          {openMenu === 'system' ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenu === 'system'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton onClick={toggleTheme}>
              <ListItemIcon>
                {theme === "light" ? <SunnyIcon/>: <BedtimeIcon/>}
              </ListItemIcon>
              <ListItemText  
                primary="Giao diện sáng/tối" 
              />
            </ListItemButton>
              {/* <div className={`absolute left-0 top-full mt-2 w-48 rounded-lg z-50 ${theme === "dark" ? "bg-neutral-800 text-white" : "bg-neutral-200 text-black"}`}>
                <ul className="py-2">
                  <li>
                    <button onClick={toggleTheme} className={`flex items-center w-full px-4 py-2 text-sm  ${theme === "dark" ? "text-white hover:bg-neutral-700" : "text-black hover:bg-neutral-300"}`}>
                      {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                      <span className="ml-2">{theme === "light" ? "Chế độ sáng" : "Chế độ tối"}</span>
                    </button>
                  </li>
                </ul>
              </div> */}
          </List>
        </Collapse>
      </List>
    </div>
  );
};

export default AdminSidebar;