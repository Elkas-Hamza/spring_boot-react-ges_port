import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../services/AuthService";
import MenuIcon from "@mui/icons-material/Menu";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import WarningIcon from "@mui/icons-material/Warning";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InventoryIcon from "@mui/icons-material/Inventory";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// Removed unused import AdminPanelSettingsIcon
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CodeIcon from "@mui/icons-material/Code";
import UserService from "../services/UserService";
import "./Navbar.css";

const COLLAPSED_WIDTH = 61;
const EXPANDED_WIDTH = 260;

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [user, setUser] = useState({
    email: localStorage.getItem("email") || "user",
    nom:
      localStorage.getItem("userName") ||
      localStorage.getItem("email")?.split("@")[0] ||
      "User",
    prenom: localStorage.getItem("userLastName") || "",
    role: localStorage.getItem("userRole") || "USER",
  });

  useEffect(() => {
    setDrawerOpen(!isMobile);
    setCollapsed(!isMobile);
  }, [isMobile]);
  const fetchUserDetails = async () => {
    console.log("Fetching user details from database...");
    try {
      const userData = await UserService.getCurrentUserDetails();
      if (userData) {
        console.log("User data fetched successfully:", userData);
        setUser({
          id: userData.id,
          email: userData.email,
          nom: userData.nom || userData.email.split("@")[0],
          prenom: userData.prenom || "",
          role: userData.role,
        });
        console.log("User state updated with database values");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      console.log("Using localStorage values as fallback");
      // Keep using localStorage values as fallback (already set in useState)
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.token) {
      setIsAuthenticated(true);
      setUserRole(currentUser.role);

      // Re-fetch user details when the component mounts
      fetchUserDetails();
    }
  }, []);
  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUser({
      email: "",
      nom: "",
      prenom: "",
      role: "",
    });
    setAnchorEl(null);
    window.location.href = "/";
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/change-password");
  };

  const handleDebugUserData = () => {
    handleMenuClose();
    UserService.debugUserData();
    fetchUserDetails();
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleSubMenuToggle = (itemId) => {
    setOpenSubMenu((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const menuItems = [
    {
      id: "dashboardGroup",
      label: "Dashboard",
      path: "/admin-dashboard",
      roles: ["ADMIN"],
      icon: <DashboardIcon />,
      subItems: [
        {
          id: "analytics",
          label: "Analytics",
          path: "/analytics",
          roles: ["ADMIN"],
          icon: <AnalyticsIcon />,
        },
        {
          id: "performance",
          label: "Performance",
          path: "/performance",
          roles: ["ADMIN"],
          icon: <SettingsIcon />,
        },
        {
          id: "users",
          label: "Users",
          path: "/users",
          roles: ["ADMIN"],
          icon: <PersonIcon />,
        },
      ],
    },

    {
      id: "equipes",
      label: "Equipes",
      path: "/equipes",
      roles: ["ADMIN", "USER"],
      icon: <PeopleIcon />,
      subItems: [
        {
          id: "personnel",
          label: "Personnel",
          path: "/personnel",
          roles: ["ADMIN"],
          icon: <PeopleIcon />,
        },
        {
          id: "soustraiteurs",
          label: "Sous-traiteurs",
          path: "/soustraiteure",
          roles: ["ADMIN"],
          icon: <BusinessIcon />,
        },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      path: "/operations",
      roles: ["ADMIN", "USER"],
      icon: <WorkIcon />,
    },
    {
      id: "escales",
      label: "Escales",
      path: "/escales",
      roles: ["ADMIN", "USER"],
      icon: <DirectionsBoatIcon />,
    },
    {
      id: "arrets",
      label: "Arrets",
      path: "/arrets",
      roles: ["ADMIN", "USER"],
      icon: <WarningIcon />,
    },
    {
      id: "engins",
      label: "Engins",
      path: "/engins",
      roles: ["ADMIN"],
      icon: <EngineeringIcon />,
    },
    {
      id: "shifts",
      label: "Shifts",
      path: "/shifts",
      roles: ["ADMIN"],
      icon: <AccessTimeIcon />,
    },
    {
      id: "conteneures",
      label: "Conteneurs",
      path: "/conteneures",
      roles: ["ADMIN"],
      icon: <InventoryIcon />,
    },
    {
      id: "navires",
      label: "Navires",
      path: "/navires",
      roles: ["ADMIN", "USER"],
      icon: <DirectionsBoatIcon />,
    },
    {
      id: "monitoring",
      label: "Monitoring",
      path: "/monitoring",
      roles: ["ADMIN"],
      icon: <AnalyticsIcon color="secondary" />,
    },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  if (!isAuthenticated) return null;

  const drawerWidth = isMobile
    ? EXPANDED_WIDTH
    : collapsed
    ? COLLAPSED_WIDTH
    : EXPANDED_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transition: "width 0.2s ease-in-out",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          minHeight: 64,
          transition: "justify-content 0.2s ease-in-out",
        }}
      >
        {!collapsed && (
          <Typography variant="h6" noWrap>
            Port Management
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={toggleCollapse}>
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
        {isMobile && drawerOpen && (
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          minHeight: 100,
        }}
      >
        {" "}
        <Avatar sx={{ width: 40, height: 40, mb: 1, bgcolor: "primary.main" }}>
          {user.nom.charAt(0).toUpperCase()}
          {user.prenom ? user.prenom.charAt(0).toUpperCase() : ""}
        </Avatar>
        {!collapsed && (
          <>
            <Typography>
              {user.prenom ? `${user.nom} ${user.prenom}` : user.nom}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {userRole === "ADMIN" ? "Administrator" : "User"}
            </Typography>
          </>
        )}
      </Box>
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {menuItems.map(
          (item) =>
            item.roles.includes(userRole) && (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    selected={
                      location.pathname === item.path ||
                      (item.subItems &&
                        item.subItems.some(
                          (sub) => location.pathname === sub.path
                        ))
                    }
                    onClick={() => {
                      handleNavigation(item.path);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: 2.5,
                      "&.Mui-selected": {
                        backgroundColor: "primary.light",
                        "&:hover": { backgroundColor: "primary.light" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? "auto" : 2,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.label} />}
                    {!collapsed && item.subItems && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubMenuToggle(item.id);
                        }}
                        size="small"
                        sx={{ ml: "auto" }}
                      >
                        {openSubMenu[item.id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                  </ListItemButton>
                </ListItem>
                {!collapsed && item.subItems && openSubMenu[item.id] && (
                  <List
                    component="div"
                    disablePadding
                    sx={{ pl: 2, backgroundColor: "rgba(0,0,0,0.02)" }}
                  >
                    {item.subItems.map(
                      (subItem) =>
                        subItem.roles.includes(userRole) && (
                          <ListItem
                            key={subItem.id}
                            disablePadding
                            sx={{ display: "block" }}
                          >
                            <ListItemButton
                              selected={location.pathname === subItem.path}
                              onClick={() => handleNavigation(subItem.path)}
                              sx={{
                                minHeight: 48,
                                justifyContent: "flex-start",
                                px: 2.5,
                                pl: 4,
                                "&.Mui-selected": {
                                  backgroundColor: "primary.main",
                                  color: "primary.contrastText",
                                  "&:hover": {
                                    backgroundColor: "primary.dark",
                                  },
                                  "& .MuiListItemIcon-root": {
                                    color: "primary.contrastText",
                                  },
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: 2,
                                  justifyContent: "center",
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText primary={subItem.label} />
                            </ListItemButton>
                          </ListItem>
                        )
                    )}
                  </List>
                )}
              </React.Fragment>
            )
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={() => handleNavigation("/settings")}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? "auto" : 2,
                justifyContent: "center",
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? "auto" : 2,
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <Box component="span" sx={{ display: "flex" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </Box>
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {" "}
      <AppBar
        position="fixed"
        sx={{
          display: isMobile ? "block" : "none",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            Port Management
          </Typography>
          <IconButton color="inherit" onClick={handleProfileClick}>
            {" "}
            <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
              {user.nom.charAt(0).toUpperCase()}
              {user.prenom ? user.prenom.charAt(0).toUpperCase() : ""}
            </Avatar>
          </IconButton>{" "}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { width: 220, maxWidth: "100%" },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              {" "}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {user.prenom ? `${user.nom} ${user.prenom}` : user.nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <Chip
                  label={user.role}
                  color={user.role === "ADMIN" ? "error" : "primary"}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                  ID: {user.id || localStorage.getItem("userId")}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={handleChangePassword}>
              <ListItemIcon>
                <VpnKeyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Change Password" />
            </MenuItem>{" "}
            <MenuItem onClick={() => fetchUserDetails()}>
              <ListItemIcon>
                <RefreshIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Refresh User Data" />
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem onClick={handleDebugUserData}>
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Debug User Data" />
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex" }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={isMobile ? toggleDrawer : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.2s ease-in-out",
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: "width 0.2s ease-in-out",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {!isMobile && (
          <Box
            sx={{
              flexGrow: 0,
              width: drawerWidth,
              transition: "width 0.2s ease-in-out",
            }}
          />
        )}
      </Box>
      {isMobile && <Toolbar />}
    </>
  );
};

export default Navbar;
