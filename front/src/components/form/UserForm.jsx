import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import UserService from "../../services/UserService";
import ErrorHandler from "../common/ErrorHandler";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "USER",
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
  const fetchUser = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const response = await UserService.getUserById(id);
      setFormData({
        email: response.data.email,
        role: response.data.role,
        nom: response.data.nom || "",
        prenom: response.data.prenom || "",
        password: "", // Password is not returned from API
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
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [isEditMode, id, fetchUser]);
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

    if (!formData.nom) {
      newErrors.nom = "First Name (Nom) is required";
    }

    if (!formData.prenom) {
      newErrors.prenom = "Last Name (Prenom) is required";
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
          nom: formData.nom,
          prenom: formData.prenom,
          role: formData.role,
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
        }); // Reset form after successful creation
        setFormData({
          email: "",
          password: "",
          nom: "",
          prenom: "",
          role: "USER",
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
        message:
          err.response?.data?.message ||
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
    <Box
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        animation: "fadeIn 0.5s ease-in-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#1976d2",
            flexGrow: 1,
          }}
        >
          {isEditMode ? "Edit User Account" : "Create New User Account"}
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, fontWeight: 500 }}
            >
              Account Information
            </Typography>

            <TextField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              required
              type="email"
              autoComplete="email"
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 3,
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="First Name"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                error={!!errors.nom}
                helperText={errors.nom}
                required
                autoComplete="given-name"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />

              <TextField
                label="Last Name"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                error={!!errors.prenom}
                helperText={errors.prenom}
                required
                autoComplete="family-name"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, fontWeight: 500 }}
            >
              Security
            </Typography>

            <TextField
              label={
                isEditMode
                  ? "New Password (leave blank to keep current)"
                  : "Password"
              }
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={
                errors.password || "Must be at least 6 characters long"
              }
              required={!isEditMode}
              type="password"
              autoComplete={isEditMode ? "new-password" : "current-password"}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
              }}
            />

            <FormControl fullWidth error={!!errors.role} sx={{ mb: 1 }}>
              <InputLabel id="role-label">User Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="User Role"
                required
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="USER">Standard User</MenuItem>
                <MenuItem value="ADMIN">Administrator</MenuItem>
              </Select>
              {errors.role && (
                <Box
                  component="span"
                  sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}
                >
                  {errors.role}
                </Box>
              )}
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Set appropriate permissions level for this user account
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 4,
              pt: 3,
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Button
              component={Link}
              to="/users"
              variant="outlined"
              color="secondary"
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 500,
                boxShadow: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditMode ? (
                "Save Changes"
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            alignItems: "center",
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
            },
            "& .MuiAlert-message": {
              fontSize: "0.95rem",
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserForm;
