import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import ArretList from "./components/list/ArretList";
import ArretForm from "./components/form/ArretForm";
import EscaleList from "./components/list/EscaleList";
import EscaleForm from "./components/form/EscaleForm";
import PersonnelList from "./components/list/PersonnelList";
import PersonnelForm from "./components/form/PersonnelForm";
import OperationList from "./components/list/OperationList";
import OperationForm from "./components/form/OperationForm";
import OperationDetails from "./components/detail/OperationDetails";
import ConteneureList from "./components/list/ConteneureList";
import ConteneureForm from "./components/form/ConteneureForm";
import ShiftList from "./components/list/ShiftList";
import ShiftForm from "./components/form/ShiftForm";
import EnginList from "./components/list/EnginList";
import EnginForm from "./components/form/EnginForm";
import EquipeList from "./components/list/EquipeList";
import EquipeForm from "./components/form/EquipeForm";
import EquipeDetails from "./components/detail/EquipeDetails";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ChangePassword from "./components/ChangePassword";
import { Container, CircularProgress } from "@mui/material";
import EscaleDetail from "./components/detail/EscaleDetail";
import AddArretToEscale from "./components/detail/AddArret";
import SoustraiteureList from "./components/list/SoustraiteureList";
import SoustraiteureForm from "./components/form/SoustraiteureForm";
import AuthService from "./services/AuthService";
import NavireList from "./components/list/NavireList";
import NavireForm from "./components/form/NavireForm";
import NavireDetail from "./components/detail/NavireDetail";
import UserList from "./components/list/UserList";
import UserForm from "./components/form/UserForm";
import UserRoleTest from "./components/debug/UserRoleTest";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import UserDashboard from "./components/dashboard/UserDashboard";
import SystemSettings from "./components/settings/SystemSettings";
import AnalyticsDashboard from "./components/dashboard/AnalyticsDashboard";
import EscaleApiTester from "./components/debug/EscaleApiTester";
import MonitoringDashboard from "./components/monitoring/MonitoringDashboard";
import SettingsService from "./services/SettingsService";
import PerformanceMonitor from "./components/monitoring/PerformanceMonitor";

// PrivateRoute component for protected routes
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const [isChecking, setIsChecking] = useState(true);
  const currentPath = window.location.pathname;

  useEffect(() => {
    // Special case handling for navires and equipes paths to prevent flashing
    const isNaviresPath = currentPath.includes("/navire");
    const isEquipesPath = currentPath.includes("/equipe");

    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = "/";
      return;
    }

    // Never redirect for navires or equipes paths if the user is ADMIN
    if ((isNaviresPath || isEquipesPath) && userRole === "ADMIN") {
      setIsChecking(false);
      return;
    }

    // Check if a role is required and user doesn't have it
    // But allow ADMIN to access any page that requires any role
    if (requiredRole && userRole !== requiredRole && userRole !== "ADMIN") {
      // Don't redirect for special cases
      if (isNaviresPath || isEquipesPath) {
        console.log("Special case for navigation - not redirecting");
        setIsChecking(false);
        return;
      }

      // Redirect to dashboard if role doesn't match
      window.location.href = "/dashboard";
      return;
    }

    setIsChecking(false);
  }, [token, userRole, requiredRole, currentPath]);

  if (isChecking) {
    return <CircularProgress />;
  }

  return children;
};

// Simple component that handles dashboard redirection without causing infinite loops
const DashboardRedirect = ({ userRole }) => {
  const navigate = useNavigate();
  const location = window.location;

  // Use a ref to track if we've redirected already
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Check if we're already on an intended path (not just /dashboard)
    const isIntendedPath = location.pathname !== "/dashboard";

    // Only redirect once and only if we're not already on a valid path
    if (!hasRedirected.current && !isIntendedPath) {
      hasRedirected.current = true;

      // Redirect based on role
      if (userRole === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/user-dashboard", { replace: true });
      }
    }
  }, [navigate, userRole, location]);

  // Return loading indication while redirecting
  return <div>Redirection en cours...</div>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Check authentication
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");

      if (token) {
        try {
          // Verify if token is still valid
          const isValid = await AuthService.verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            setUserRole(role); // Initialize performance monitoring (only when authenticated)
            try {
              // Add delay to ensure proper initialization order
              setTimeout(async () => {
                try {
                  await SettingsService.initPerformanceMonitoring();
                  console.log("Performance monitoring initialized");
                } catch (perfError) {
                  console.error(
                    "Error initializing performance monitoring:",
                    perfError
                  );
                }
              }, 500);
            } catch (perfError) {
              console.error(
                "Error preparing performance monitoring initialization:",
                perfError
              );
            }
          } else {
            // Token is invalid, perform logout
            AuthService.logout();
          }
        } catch (error) {
          console.error("Token verification error:", error);
          AuthService.logout();
        }
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Container sx={{ mt: isAuthenticated ? 4 : 0 }}>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRedirect userRole={userRole} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Arret Routes */}
          <Route
            path="/arrets"
            element={
              <PrivateRoute>
                <ArretList />
              </PrivateRoute>
            }
          />
          <Route
            path="/arrets/create"
            element={
              <PrivateRoute>
                <ArretForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/arret/create/:escaleId"
            element={
              <PrivateRoute>
                <AddArretToEscale />
              </PrivateRoute>
            }
          />
          <Route
            path="/arret/add/:escaleId/:operationId"
            element={
              <PrivateRoute>
                <AddArretToEscale />
              </PrivateRoute>
            }
          />
          <Route
            path="/arrets/edit/:id"
            element={
              <PrivateRoute>
                <AddArretToEscale />
              </PrivateRoute>
            }
          />

          {/* Escale Routes */}
          <Route
            path="/escales"
            element={
              <PrivateRoute>
                <EscaleList />
              </PrivateRoute>
            }
          />
          <Route
            path="/escale/create"
            element={
              <PrivateRoute>
                <EscaleForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/escale/edit/:id"
            element={
              <PrivateRoute>
                <EscaleForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/escale/:id"
            element={
              <PrivateRoute>
                <EscaleDetail />
              </PrivateRoute>
            }
          />

          {/* Personnel Routes */}
          <Route
            path="/personnel"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <PersonnelList />
              </PrivateRoute>
            }
          />
          <Route
            path="/personnel/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <PersonnelForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/personnel/edit/:matricule"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <PersonnelForm />
              </PrivateRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UserList />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UserForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UserForm />
              </PrivateRoute>
            }
          />

          {/* Soustraiteure Routes */}
          <Route
            path="/soustraiteure"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <SoustraiteureList />
              </PrivateRoute>
            }
          />
          <Route
            path="/soustraiteure/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <SoustraiteureForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/soustraiteure/edit/:matricule"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <SoustraiteureForm />
              </PrivateRoute>
            }
          />

          {/* Operation Routes */}
          <Route
            path="/operations"
            element={
              <PrivateRoute>
                <OperationList />
              </PrivateRoute>
            }
          />
          <Route
            path="/operation/create"
            element={
              <PrivateRoute>
                <OperationForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/operation/edit/:id"
            element={
              <PrivateRoute>
                <OperationForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/operation/:id"
            element={
              <PrivateRoute>
                <OperationDetails />
              </PrivateRoute>
            }
          />

          {/* Conteneures Routes */}
          <Route
            path="/conteneures"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ConteneureList />
              </PrivateRoute>
            }
          />
          <Route
            path="/conteneures/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ConteneureForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/conteneures/add"
            element={<Navigate to="/conteneures/create" />}
          />
          <Route
            path="/conteneures/edit/:id"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ConteneureForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/conteneure/add"
            element={<Navigate to="/conteneures/create" />}
          />
          <Route
            path="/conteneure/create"
            element={<Navigate to="/conteneures/create" />}
          />
          <Route
            path="/conteneure/edit/:id"
            element={<Navigate replace to="/conteneures/edit/:id" />}
          />
          <Route
            path="/conteneure/:action"
            element={<Navigate replace to="/conteneures/:action" />}
          />

          {/* Equipe Routes */}
          <Route
            path="/equipes"
            element={
              <PrivateRoute>
                <EquipeList />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipes/create"
            element={
              <PrivateRoute>
                <EquipeForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipe/create"
            element={
              <PrivateRoute>
                <EquipeForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipes/edit/:id"
            element={
              <PrivateRoute>
                <EquipeForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipe/edit/:id"
            element={
              <PrivateRoute>
                <EquipeForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipes/:id"
            element={
              <PrivateRoute>
                <EquipeDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipe/:id"
            element={
              <PrivateRoute>
                <EquipeDetails />
              </PrivateRoute>
            }
          />

          {/* Shift Routes */}
          <Route
            path="/shifts"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShiftList />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShiftForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/shifts/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShiftForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/shift/edit/:id"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShiftForm />
              </PrivateRoute>
            }
          />

          {/* Engin Routes */}
          <Route
            path="/engins"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <EnginList />
              </PrivateRoute>
            }
          />
          <Route
            path="/engin/create"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <EnginForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/engin/edit/:id"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <EnginForm />
              </PrivateRoute>
            }
          />

          {/* Navire Routes */}
          <Route
            path="/navires"
            element={
              <PrivateRoute>
                <NavireList />
              </PrivateRoute>
            }
          />
          <Route
            path="/navires/create"
            element={
              <PrivateRoute>
                <NavireForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/navire/create"
            element={
              <PrivateRoute>
                <NavireForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/navire/edit/:id"
            element={
              <PrivateRoute>
                <NavireForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/navire/details/:id"
            element={
              <PrivateRoute>
                <NavireDetail />
              </PrivateRoute>
            }
          />

          {/* Debug Routes */}
          <Route path="/debug/user-role-test" element={<UserRoleTest />} />
          <Route
            path="/debug/escale-api-tester"
            element={<EscaleApiTester />}
          />

          {/* Settings Routes */}
          <Route
            path="/settings"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <SystemSettings />
              </PrivateRoute>
            }
          />

          {/* Analytics Routes */}
          <Route
            path="/analytics"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />

          {/* Performance Routes */}
          <Route
            path="/performance"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <MonitoringDashboard />
              </PrivateRoute>
            }
          />

          {/* Performance Monitor Route (always-on, for all roles) */}
          <Route path="/monitoring" element={<PerformanceMonitor />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
