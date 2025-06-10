import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Paper, Typography, Box } from "@mui/material";

const AuthDebug = () => {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    console.log("=== AUTH DEBUG ===");
    console.log("Current path:", location.pathname);
    console.log("User role:", userRole);
    console.log("Token exists:", !!token);
    console.log(
      "Token value:",
      token ? token.substring(0, 20) + "..." : "null"
    );
    console.log("==================");
  }, [location]);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  
};

export default AuthDebug;
