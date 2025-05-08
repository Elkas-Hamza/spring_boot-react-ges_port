import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserService from "../../services/UserService";
import ErrorHandler from "../common/ErrorHandler";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "USER"
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const response = await UserService.getUserById(id);
      setFormData({
        email: response.data.email,
        role: response.data.role,
        password: "" // Password is not returned from API
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to load user. Please try again."
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!isEditMode && !formData.password) {
      newErrors.password = "Password is required";
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (isEditMode) {
        // For edit, only send the changed fields
        const updateData = {
          email: formData.email,
          role: formData.role
        };
        
        // Only include password if it was provided
        if (formData.password.trim() !== "") {
          updateData.password = formData.password;
        }
        
        await UserService.updateUser(id, updateData);
        setNotification({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        await UserService.createUser(formData);
        setNotification({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
        
        // Reset form after successful creation
        setFormData({
          email: "",
          password: "",
          role: "USER"
        });
      }
      
      // Navigate back to user list after a short delay
      setTimeout(() => {
        navigate("/users");
      }, 2000);
    } catch (err) {
      console.error("Error saving user:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 
                 "Failed to save user. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorHandler message={error} onRetry={fetchUser} />;
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>
        {isEditMode ? "Edit User" : "Create New User"}
      </Typography>

      <Paper elevation={3} className="p-6 mt-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              required
              type="email"
              autoComplete="email"
            />
            
            <TextField
              label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
              required={!isEditMode}
              type="password"
              autoComplete={isEditMode ? "new-password" : "current-password"}
            />
            
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
                required
              >
                <MenuItem value="USER">User</MenuItem>
              </Select>
              {errors.role && (
                <Box component="span" sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                  {errors.role}
                </Box>
              )}
            </FormControl>
          </div>
          
          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/users"
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditMode ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserForm; 