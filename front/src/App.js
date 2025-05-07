import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ArretList from './components/list/ArretList';
import ArretForm from './components/form/ArretForm';
import EscaleList from './components/list/EscaleList';
import EscaleForm from './components/form/EscaleForm';
import PersonnelList from './components/list/PersonnelList';
import PersonnelForm from './components/form/PersonnelForm';
import OperationList from './components/list/OperationList';
import OperationForm from './components/form/OperationForm';
import OperationDetails from './components/detail/OperationDetails';
import ConteneureList from './components/list/ConteneureList';
import ConteneureForm from './components/form/ConteneureForm';
import ShiftList from './components/list/ShiftList';
import ShiftForm from './components/form/ShiftForm';
import EnginList from './components/list/EnginList';
import EnginForm from './components/form/EnginForm';
import EquipeList from './components/list/EquipeList';
import EquipeForm from './components/form/EquipeForm';
import EquipeDetails from './components/detail/EquipeDetails';
import Navbar from './components/Navbar';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import { Container } from '@mui/material';
import EscaleDetail from './components/detail/EscaleDetail';
import AddArretToEscale from './components/detail/AddArret';
import SoustraiteureList from './components/list/SoustraiteureList';
import SoustraiteureForm from './components/form/SoustraiteureForm';
import AuthService from './services/AuthService';
import NavireList from './components/list/NavireList';
import NavireForm from './components/form/NavireForm';
import NavireDetail from './components/detail/NavireDetail';

// PrivateRoute component for protected routes
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Simple component that handles dashboard redirection without causing infinite loops
const DashboardRedirect = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Use a ref to track if we've redirected already
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    // Only redirect once
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      
      // Redirect based on role
      if (userRole === 'ADMIN') {
        navigate('/personnel', { replace: true });
      } else {
        navigate('/operations', { replace: true });
      }
    }
  }, [navigate, userRole]);
  
  // Return loading indication while redirecting
  return <div>Redirection en cours...</div>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      
      if (token) {
        try {
          // Verify if token is still valid
          const isValid = await AuthService.verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            setUserRole(role);
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

    checkAuth();
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
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardRedirect userRole={userRole} />
            </PrivateRoute>
          } />
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
          <Route path="/arrets" element={
            <PrivateRoute>
              <ArretList />
            </PrivateRoute>
          } />
          <Route path="/arrets/create" element={
            <PrivateRoute>
              <ArretForm />
            </PrivateRoute>
          } />
          <Route path="/arret/create/:escaleId" element={
            <PrivateRoute>
              <AddArretToEscale />
            </PrivateRoute>
          } />
          <Route path="/arret/add/:escaleId/:operationId" element={
            <PrivateRoute>
              <AddArretToEscale />
            </PrivateRoute>
          } />
          <Route path="/arrets/edit/:id" element={
            <PrivateRoute>
              <AddArretToEscale />
            </PrivateRoute>
          } />
          
          {/* Escale Routes */}
          <Route path="/escales" element={
            <PrivateRoute>
              <EscaleList />
            </PrivateRoute>
          } />
          <Route path="/escale/create" element={
            <PrivateRoute>
              <EscaleForm />
            </PrivateRoute>
          } />
          <Route path="/escale/edit/:id" element={
            <PrivateRoute>
              <EscaleForm />
            </PrivateRoute>
          } />
          <Route path="/escale/:id" element={
            <PrivateRoute>
              <EscaleDetail />
            </PrivateRoute>
          } />

          {/* Personnel Routes */}
          <Route path="/personnel" element={
            <PrivateRoute requiredRole="ADMIN">
              <PersonnelList />
            </PrivateRoute>
          } />
          <Route path="/personnel/create" element={
            <PrivateRoute requiredRole="ADMIN">
              <PersonnelForm />
            </PrivateRoute>
          } />
          <Route path="/personnel/edit/:matricule" element={
            <PrivateRoute requiredRole="ADMIN">
              <PersonnelForm />
            </PrivateRoute>
          } />
          
          {/* Soustraiteure Routes */}
          <Route path="/soustraiteure" element={
            <PrivateRoute requiredRole="ADMIN">
              <SoustraiteureList />
            </PrivateRoute>
          } />
          <Route path="/soustraiteure/create" element={
            <PrivateRoute requiredRole="ADMIN">
              <SoustraiteureForm />
            </PrivateRoute>
          } />
          <Route path="/soustraiteure/edit/:matricule" element={
            <PrivateRoute requiredRole="ADMIN">
              <SoustraiteureForm />
            </PrivateRoute>
          } />
          
          {/* Operation Routes */}
          <Route path="/operations" element={
            <PrivateRoute>
              <OperationList />
            </PrivateRoute>
          } />
          <Route path="/operations/create" element={
            <PrivateRoute>
              <OperationForm />
            </PrivateRoute>
          } />
          <Route path="/operations/edit/:id" element={
            <PrivateRoute>
              <OperationForm />
            </PrivateRoute>
          } />
          <Route path="/operations/:id" element={
            <PrivateRoute>
              <OperationDetails />
            </PrivateRoute>
          } />
          
          {/* Conteneure Routes */}
          <Route path="/conteneures" element={
            <PrivateRoute requiredRole="ADMIN">
              <ConteneureList />
            </PrivateRoute>
          } />
          <Route path="/conteneures/add" element={
            <PrivateRoute requiredRole="ADMIN">
              <ConteneureForm />
            </PrivateRoute>
          } />
          <Route path="/conteneures/edit/:id" element={
            <PrivateRoute requiredRole="ADMIN">
              <ConteneureForm />
            </PrivateRoute>
          } />
          
          {/* Shift Routes */}
          <Route path="/shifts" element={
            <PrivateRoute requiredRole="ADMIN">
              <ShiftList />
            </PrivateRoute>
          } />
          <Route path="/shifts/new" element={
            <PrivateRoute requiredRole="ADMIN">
              <ShiftForm />
            </PrivateRoute>
          } />
          <Route path="/shifts/edit/:id" element={
            <PrivateRoute requiredRole="ADMIN">
              <ShiftForm />
            </PrivateRoute>
          } />
          
          {/* Engin Routes */}
          <Route path="/engins" element={
            <PrivateRoute requiredRole="ADMIN">
              <EnginList />
            </PrivateRoute>
          } />
          <Route path="/engins/new" element={
            <PrivateRoute requiredRole="ADMIN">
              <EnginForm />
            </PrivateRoute>
          } />
          <Route path="/engins/edit/:id" element={
            <PrivateRoute requiredRole="ADMIN">
              <EnginForm />
            </PrivateRoute>
          } />

          {/* Equipe Routes */}
          <Route path="/equipes" element={
            <PrivateRoute>
              <EquipeList />
            </PrivateRoute>
          } />
          <Route path="/equipes/create" element={
            <PrivateRoute>
              <EquipeForm />
            </PrivateRoute>
          } />
          <Route path="/equipes/edit/:id" element={
            <PrivateRoute>
              <EquipeForm />
            </PrivateRoute>
          } />
          <Route path="/equipes/:id" element={
            <PrivateRoute>
              <EquipeDetails />
            </PrivateRoute>
          } />

          {/* Navire Routes */}
          <Route path="/navires" element={
            <PrivateRoute>
              <NavireList />
            </PrivateRoute>
          } />
          <Route path="/navires/create" element={
            <PrivateRoute>
              <NavireForm />
            </PrivateRoute>
          } />
          <Route path="/navires/edit/:id" element={
            <PrivateRoute>
              <NavireForm />
            </PrivateRoute>
          } />
          <Route path="/navires/details/:id" element={
            <PrivateRoute>
              <NavireDetail />
            </PrivateRoute>
          } />
          
          {/* Catch all redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
