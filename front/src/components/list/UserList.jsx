import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import UserService from "../../services/UserService";
import ErrorHandler from "../common/ErrorHandler";
import UserItem from "../item/UserItem";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter((user) =>
        `${user.id} ${user.email} ${user.role}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await UserService.deleteUser(userToDelete.id);
      setUsers((prevUsers) => 
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );
      setNotification({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 
                 "Failed to delete user. Please try again.",
        severity: "error",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Button
          component={Link}
          to="/users/create"
          variant="contained"
          className="mb-3"
          startIcon={<AddIcon />}
        >
          Add User
        </Button>
      </div>

      <TextField
        label="Search by email or role"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <ErrorHandler message={error} onRetry={fetchUsers} />}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && !error && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  onDelete={handleOpenDeleteDialog}
                />
              ))
            ) : !loading && !error && filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user:{" "}
            <strong>{userToDelete?.email}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
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

export default UserList; 