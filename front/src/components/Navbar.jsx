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

  const menuItems = [
    {
      id: 'adminDashboard',
      label: 'Admin Dashboard',
      path: '/admin-dashboard',
      roles: ['ADMIN']
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['ADMIN', 'USER']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      roles: ['ADMIN']
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      roles: ['ADMIN']
    },
    {
      id: 'personnel',
      label: 'Personnel',
      path: '/personnel',
      roles: ['ADMIN']
    },
    {
      id: 'users',
      label: 'Users',
      path: '/users',
      roles: ['ADMIN']
    },
    {
      id: 'soustraiteurs',
      label: 'Sous-traiteurs',
      path: '/soustraiteure',
      roles: ['ADMIN']
    },
    {
      id: 'equipes',
      label: 'Equipes',
      path: '/equipes',
      roles: ['ADMIN', 'USER']
    },
    {
      id: 'operations',
      label: 'Operations',
      path: '/operations',
      roles: ['ADMIN', 'USER']
    },
    {
      id: 'escales',
      label: 'Escales',
      path: '/escales',
      roles: ['ADMIN', 'USER']
    },
    {
      id: 'arrets',
      label: 'Arrets',
      path: '/arrets',
      roles: ['ADMIN', 'USER']
    },
    {
      id: 'engins',
      label: 'Engins',
      path: '/engins',
      roles: ['ADMIN']
    },
    {
      id: 'shifts',
      label: 'Shifts',
      path: '/shifts',
      roles: ['ADMIN']
    },
    {
      id: 'conteneures',
      label: 'Conteneurs',
      path: '/conteneures',
      roles: ['ADMIN']
    },
    {
      id: 'conteneuresManagement',
      label: 'Gestion Conteneurs',
      path: '/conteneures/management',
      roles: ['ADMIN']
    },
    {
      id: 'navires',
      label: 'Navires',
      path: '/navires',
      roles: ['ADMIN', 'USER']
    }
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
          {menuItems.map((item) => (
            item.roles.includes(userRole) && (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => window.location.href = item.path}
              >
                {item.label}
              </Button>
            )
          ))}
          
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
