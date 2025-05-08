import React from "react";
import { TableRow, TableCell, IconButton, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

const UserItem = ({ user, onDelete }) => {
  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <TableRow hover>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Chip
          label={user.role}
          color={user.role === "ADMIN" ? "error" : "primary"}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>{formatDate(user.lastLogin)}</TableCell>
      <TableCell align="center">

        {user.role !== "ADMIN" && (
          <> 
          <IconButton
            color="error"
            aria-label="delete"
            size="small"
            onClick={() => onDelete(user)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
                  <IconButton
                  component={Link}
                  to={`/users/edit/${user.id}`}
                  color="primary"
                  aria-label="edit"
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default UserItem; 