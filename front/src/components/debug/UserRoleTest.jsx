import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Alert, Stack } from "@mui/material";
import UserService from "../../services/UserService";
import ConteneureService from "../../services/ConteneureService";

const UserRoleTest = () => {
  const [userData, setUserData] = useState({
    token: null,
    role: null,
    userId: null,
    email: null,
  });
  const [tokenPayload, setTokenPayload] = useState(null);
  const [error, setError] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);
  const [adminCheckResult, setAdminCheckResult] = useState(null);
  const [userCheckResult, setUserCheckResult] = useState(null);
  const [userCreatePermResult, setUserCreatePermResult] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");

    setUserData({
      token,
      role,
      userId,
      email,
    });

    if (token) {
      try {
        // Parse JWT token (without validation)
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        setTokenPayload(JSON.parse(jsonPayload));
      } catch (err) {
        setError("Error parsing token: " + err.message);
      }
    }
  }, []);

  const refreshUserData = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");

    setUserData({
      token,
      role,
      userId,
      email,
    });
  };

  const testUserEndpoint = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert(`Success! Got ${data.length} users`);
    } catch (err) {
      setError(`Error accessing users API: ${err.message}`);
    }
  };

  const getAuthInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/auth/debug/info",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAuthInfo(data);
    } catch (err) {
      setError(`Error getting auth info: ${err.message}`);
    }
  };

  const testAdminCheck = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/auth/debug/admin-check",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAdminCheckResult({ status: "success", message: data.message });
      } else {
        setAdminCheckResult({
          status: "error",
          message: data.error || "Access denied",
        });
      }
    } catch (err) {
      setAdminCheckResult({ status: "error", message: err.message });
    }
  };

  const testUserCheck = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/auth/debug/user-check",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUserCheckResult({ status: "success", message: data.message });
      } else {
        setUserCheckResult({
          status: "error",
          message: data.error || "Access denied",
        });
      }
    } catch (err) {
      setUserCheckResult({ status: "error", message: err.message });
    }
  };

  const testUserCreatePermission = async () => {
    try {
      setUserCreatePermResult({
        status: "success",
        message: "You have permission to create users!",
      });
    } catch (err) {
      setUserCreatePermResult({
        status: "error",
        message: err.response?.data?.error || err.message || "Access denied",
      });
    }
  };

  const testContainerAuth = async () => {
    try {
      const response = await ConteneureService.testAuthForContainers();
      alert(`Container Auth Test: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      setError(`Error testing container auth: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Debug Info
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          User Authentication Data:
        </Typography>
        <Typography>
          <strong>Email:</strong> {userData.email || "Not found"}
        </Typography>
        <Typography>
          <strong>User ID:</strong> {userData.userId || "Not found"}
        </Typography>
        <Typography>
          <strong>Role:</strong> {userData.role || "Not found"}
        </Typography>
        <Typography>
          <strong>Token:</strong>{" "}
          {userData.token
            ? `${userData.token.substring(0, 15)}...`
            : "Not found"}
        </Typography>
      </Paper>

      {tokenPayload && (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            JWT Token Payload:
          </Typography>
          <Typography>
            <strong>Subject (email):</strong> {tokenPayload.sub || "Not found"}
          </Typography>
          <Typography>
            <strong>Roles:</strong>{" "}
            {tokenPayload.roles
              ? tokenPayload.roles.join(", ")
              : "No roles found"}
          </Typography>
          <Typography>
            <strong>Expiration:</strong>{" "}
            {tokenPayload.exp
              ? new Date(tokenPayload.exp * 1000).toLocaleString()
              : "Not found"}
          </Typography>
          <Typography>
            <strong>Issued at:</strong>{" "}
            {tokenPayload.iat
              ? new Date(tokenPayload.iat * 1000).toLocaleString()
              : "Not found"}
          </Typography>
        </Paper>
      )}

      {authInfo && (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Server Authentication Info:
          </Typography>
          <Typography>
            <strong>Principal:</strong> {authInfo.principal}
          </Typography>
          <Typography>
            <strong>Authenticated:</strong> {String(authInfo.authenticated)}
          </Typography>
          <Typography>
            <strong>Name:</strong> {authInfo.name}
          </Typography>
          <Typography>
            <strong>Authorities:</strong>{" "}
            {authInfo.authorities ? authInfo.authorities.join(", ") : "None"}
          </Typography>
        </Paper>
      )}

      {adminCheckResult && (
        <Alert
          severity={adminCheckResult.status === "success" ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          <Typography>
            <strong>Admin Check:</strong> {adminCheckResult.message}
          </Typography>
        </Alert>
      )}

      {userCheckResult && (
        <Alert
          severity={userCheckResult.status === "success" ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          <Typography>
            <strong>User Check:</strong> {userCheckResult.message}
          </Typography>
        </Alert>
      )}

      {userCreatePermResult && (
        <Alert
          severity={
            userCreatePermResult.status === "success" ? "success" : "error"
          }
          sx={{ mb: 2 }}
        >
          <Typography>
            <strong>User Creation Permission:</strong>{" "}
            {userCreatePermResult.message}
          </Typography>
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3, flexWrap: "wrap", gap: 2 }}
      >
        <Button variant="contained" color="primary" onClick={refreshUserData}>
          Refresh Local Data
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={testUserEndpoint}
        >
          Test Users API
        </Button>
        <Button variant="contained" color="info" onClick={getAuthInfo}>
          Get Auth Info
        </Button>
        <Button variant="contained" color="success" onClick={testAdminCheck}>
          Test Admin Access
        </Button>
        <Button variant="contained" color="warning" onClick={testUserCheck}>
          Test User Access
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={testUserCreatePermission}
        >
          Test User Creation Perm
        </Button>
        <Button variant="contained" color="warning" onClick={testContainerAuth}>
          Test Container Auth
        </Button>
      </Stack>
    </Box>
  );
};

export default UserRoleTest;
