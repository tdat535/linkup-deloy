import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  IconButton,
  Drawer,
  useTheme,
  alpha,
  Paper,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Home,
  Search,
  MessageSquare,
  Bell,
  User,
  MoreHorizontal,
  Sun,
  Moon,
  Plus,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import PostModal from "../Modal/PostModal";
import { useTheme as useAppTheme } from "../../../context/ThemeContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { theme: appTheme, toggleTheme } = useAppTheme();
  const [isBottomNavVisible] = useState(true);
  const currentUserId = localStorage.getItem("currentUserId") || "default-id";
  const profileUrl =
    currentUserId !== "default-id"
      ? `/home/profile?userId=${currentUserId}`
      : "/login";

  // MUI theme
  const muiTheme = useTheme();
  const location = useLocation();

  // Menu items configuration
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.userType === "admin";

  const menuItems = [
    { path: "/home", icon: <Home />, text: "Trang chủ" },
    { path: "/home/search", icon: <Search />, text: "Khám phá" },
    { path: "/home/messages", icon: <MessageSquare />, text: "Tin nhắn" },
    { path: "/home/notifications", icon: <Bell />, text: "Thông báo" },
    { path: profileUrl, icon: <User />, text: "Trang cá nhân" },
    ...(isAdmin
      ? [{ path: "/admin", icon: <Settings />, text: "Đến trang admin" }]
      : []),
  ];

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path !== "/home" && location.pathname.startsWith(path))
    );
  };

  // Colors for active and hover states
  const isDarkMode = appTheme === "dark";
  const activeBackgroundColor = isDarkMode
    ? alpha(muiTheme.palette.primary.main, 0.2)
    : alpha(muiTheme.palette.primary.main, 0.1);
  const hoverBackgroundColor = isDarkMode
    ? alpha(muiTheme.palette.primary.main, 0.1)
    : alpha(muiTheme.palette.primary.main, 0.05);
  const activeTextColor = muiTheme.palette.primary.main;
  const normalTextColor = isDarkMode ? "#fff" : "#000";

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            border: "none",
            borderRight: 1,
            borderColor: isDarkMode ? "grey.800" : "grey.200",
            backgroundColor: isDarkMode ? "#1C1C1D" : "#f0f2f5",
            color: isDarkMode ? "#fff" : "#000",
            overflow: "hidden",
          },
        }}
        open
      >
        <Box sx={{ p: 3 }}>
          <Link to="/home" style={{ textDecoration: "none" }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                mb: 4,
                fontFamily: "cursive",
                color: isDarkMode ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              𝓛𝓲𝓷𝓴𝓤𝓹
            </Typography>
          </Link>

          <List sx={{ width: "100%" }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                disablePadding
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: isActive(item.path)
                    ? activeBackgroundColor
                    : "transparent",
                  "&:hover": {
                    backgroundColor: hoverBackgroundColor,
                    transition: "background-color 0.3s ease",
                  },
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 1.5,
                    px: 2,
                    width: "100%",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path)
                        ? activeTextColor
                        : normalTextColor,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "1rem",
                      fontWeight: isActive(item.path) ? "bold" : "normal",
                      color: isActive(item.path) ? activeTextColor : "inherit",
                    }}
                  />
                </Box>
              </ListItem>
            ))}

            <ListItem
              disablePadding
              sx={{
                mb: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: hoverBackgroundColor,
                  transition: "background-color 0.3s ease",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 1.5,
                  px: 2,
                  width: "100%",
                  cursor: "pointer",
                }}
                onClick={handleOpenMenu}
              >
                <ListItemIcon sx={{ minWidth: 40, color: normalTextColor }}>
                  <MoreHorizontal />
                </ListItemIcon>
                <ListItemText primary="Thêm" />
              </Box>
            </ListItem>
          </List>

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                backgroundColor: isDarkMode ? "neutral.800" : "neutral.100",
                boxShadow: 3,
                borderRadius: 2,
                minWidth: 180,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                toggleTheme();
                handleCloseMenu();
              }}
            >
              <ListItemIcon>
                {isDarkMode ? (
                  <Sun fontSize="small" />
                ) : (
                  <Moon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
              />
            </MenuItem>
          </Menu>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Plus size={16} />}
              onClick={() => setIsOpen(true)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              Đăng
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Mobile Bottom Navigation */}
      <Paper
        component={motion.div}
        initial={{ y: 0 }}
        animate={{ y: isBottomNavVisible ? 0 : 100 }}
        transition={{ duration: 0.3 }}
        elevation={3}
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: isDarkMode ? "grey.800" : "grey.200",
          backgroundColor: isDarkMode ? "#1C1C1D" : "#fff",
          justifyContent: "space-around",
          alignItems: "center",
          py: 0.5,
        }}
      >
        {menuItems.slice(0, 5).map((item) => (
          <IconButton
            key={item.path}
            component={Link}
            to={item.path}
            sx={{
              color: isActive(item.path)
                ? activeTextColor
                : isDarkMode
                ? "grey.400"
                : "grey.600",
              p: 1.5,
              transition: "all 0.2s ease",
            }}
          >
            {item.icon}
          </IconButton>
        ))}
        <IconButton
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{
            p: 1,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            boxShadow: 2,
            borderRadius: "50%",
          }}
        >
          <Plus size={22} />
        </IconButton>
      </Paper>

      {/* Post Modal */}
      {isOpen && (
        <PostModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          refreshPosts={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
