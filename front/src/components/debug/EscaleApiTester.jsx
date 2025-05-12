import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Container,
  Paper,
  TextField,
  Alert,
} from "@mui/material";
import { NavireService } from "../../services/NavireService";

/**
 * Debug tool to test different payload formats for the Escale API
 */
const EscaleApiTester = () => {
  const [navires, setNavires] = useState([]);
  const [selectedNavire, setSelectedNavire] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNavires = async () => {
      try {
        setLoading(true);
        const response = await NavireService.getAllNavires();
        if (response.success) {
          setNavires(response.data);
          if (response.data.length > 0) {
            setSelectedNavire(response.data[0]);
          }
        } else {
          console.error("Failed to fetch navires:", response.message);
        }
      } catch (error) {
        console.error("Error fetching navires:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavires();
  }, []);

  const formatDateForBackend = (date = new Date()) => {
    return date.toISOString().split(".")[0]; // Format as yyyy-MM-ddTHH:mm:ss
  };

  const runTest = async (format) => {
    if (!selectedNavire) {
      alert("Please select a navire first");
      return;
    }

    try {
      setLoading(true);
      const currentDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(currentDate.getDate() + 1);

      const isoDate1 = formatDateForBackend(currentDate);
      const isoDate2 = formatDateForBackend(tomorrow);

      // Create different payload formats for testing
      let testPayload;

      switch (format) {
        case "fk-only":
          testPayload = {
            NOM_navire: selectedNavire.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            MATRICULE_navire: selectedNavire.matriculeNavire,
          };
          break;

        case "nested":
          testPayload = {
            NOM_navire: selectedNavire.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            navire: {
              matriculeNavire: selectedNavire.matriculeNavire,
              idNavire: selectedNavire.idNavire,
              nomNavire: selectedNavire.nomNavire,
            },
          };
          break;

        case "hybrid":
          testPayload = {
            NOM_navire: selectedNavire.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            MATRICULE_navire: selectedNavire.matriculeNavire,
            navire: {
              matriculeNavire: selectedNavire.matriculeNavire,
            },
          };
          break;

        default:
          alert("Unknown test format");
          return;
      }

      console.log(
        `Testing format "${format}":`,
        JSON.stringify(testPayload, null, 2)
      );

      // Send direct fetch request for testing
      const response = await fetch("http://localhost:8080/api/escales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(testPayload),
      });

      const status = response.status;
      let responseText;

      try {
        responseText = await response.text();
        console.log("Response data:", responseText);
      } catch (e) {
        responseText = "Could not read response body";
      }

      const result = {
        format,
        status,
        timestamp: new Date().toLocaleTimeString(),
        success: response.ok,
        response: responseText,
      };

      setTestResults((prev) => [result, ...prev]);
    } catch (error) {
      console.error(`Error testing format "${format}":`, error);
      setTestResults((prev) => [
        {
          format,
          status: "Error",
          timestamp: new Date().toLocaleTimeString(),
          success: false,
          response: error.message,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Escale API Testing Tool
      </Typography>

      {navires.length === 0 ? (
        <Alert severity="warning">No navires available for testing</Alert>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Navire
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="ID"
                value={selectedNavire?.idNavire || ""}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Name"
                value={selectedNavire?.nomNavire || ""}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Matricule"
                value={selectedNavire?.matriculeNavire || ""}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Different Payload Formats
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => runTest("fk-only")}
                disabled={loading}
              >
                Test FK Only Format
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => runTest("nested")}
                disabled={loading}
              >
                Test Nested Object Format
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => runTest("hybrid")}
                disabled={loading}
              >
                Test Hybrid Format
              </Button>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            {testResults.length === 0 ? (
              <Alert severity="info">No tests run yet</Alert>
            ) : (
              testResults.map((result, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: result.success ? "success.main" : "error.main",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color={result.success ? "success.main" : "error.main"}
                  >
                    {result.timestamp} - Format:{" "}
                    <strong>{result.format}</strong> - Status:{" "}
                    <strong>{result.status}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                  >
                    {result.response && result.response.length > 500
                      ? `${result.response.substring(0, 500)}...`
                      : result.response}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default EscaleApiTester;
