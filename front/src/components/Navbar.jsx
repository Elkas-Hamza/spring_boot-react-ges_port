import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    // Check authentication status
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUsername(user.username || "User");
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    AuthService.logout();
    
    // Update component state
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername("");
    setAnchorEl(null);
    
    // Use window.location for a full page reload and navigation
    window.location.href = '/';
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate('/change-password');
  };

  const userNavItems = [
    { label: "Opérations", path: "/operations" },
    { label: "Escales", path: "/escales" },
    { label: "Équipes", path: "/equipes" },
    { label: "Navires", path: "/navires" },
  ];

  const adminNavItems = [
    { label: "Personnel", path: "/personnel" },
    { label: "Sous-traitants", path: "/soustraiteure" },
    { label: "Shifts", path: "/shifts" },
    { label: "Conteneurs", path: "/conteneures" },
    { label: "Équipement", path: "/engins" },
    { label: "Navires", path: "/navires" },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          System De Management Des Port
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userRole === 'ADMIN' ? (
            adminNavItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            ))
          ) : (
            userNavItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            ))
          )}
          
          <IconButton 
            color="inherit" 
            onClick={handleProfileClick}
            sx={{ ml: 2 }}
          >
            <Avatar 
              sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
            >
              {email.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              {email}
            </MenuItem>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
