import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  SystemUpdateAlt as SystemUpdateIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import SettingsService from "../../services/SettingsService";

const SystemSettings = () => {
  // Initialize with empty structure to prevent "undefined" errors
  const [settings, setSettings] = useState({
    general: {
      siteName: "",
      adminEmail: "",
      timezone: "",
      language: "",
      dateFormat: "",
      timeFormat: "",
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: false,
      passwordRequireNumbers: false,
      passwordRequireSymbols: false,
      sessionTimeout: 30,
      loginAttempts: 3,
      twoFactorAuth: false,
    },
    email: {
      smtpServer: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpSecure: false,
      senderName: "",
      senderEmail: "",
    },
    notifications: {
      emailNotifications: false,
      operationCreated: false,
      operationUpdated: false,
      escaleCreated: false,
      userAccountCreated: false,
      systemErrors: false,
    },
    backup: {
      autoBackup: false,
      backupFrequency: "daily",
      backupTime: "00:00",
      retentionDays: 7,
      backupLocation: "",
    },
    performance: {
      enableMonitoring: false,
      autoStartMonitoring: false,
      dataRetentionDays: 7,
      maxDataPoints: 100,
      monitoringRefreshInterval: 5000,
      alertOnSlowResponses: false,
      slowResponseThreshold: 5000,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const initialSettings = useRef(null);
  // Load settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await SettingsService.getSettings();

        // Ensure all required setting categories exist to prevent "undefined" errors
        const requiredCategories = [
          "general",
          "security",
          "email",
          "notifications",
          "backup",
          "performance",
        ];
        const defaultSettings = await SettingsService.getDefaultSettings();

        // For any missing category, use the defaults
        requiredCategories.forEach((category) => {
          if (!data[category]) {
            console.warn(
              `Missing settings category: ${category}, using defaults`
            );
            data[category] = defaultSettings[category];
          }
        });

        setSettings(data);
        initialSettings.current = JSON.parse(JSON.stringify(data)); // Deep copy for reset
      } catch (error) {
        console.error("Error loading settings:", error);
        setSnackbar({
          open: true,
          message: "Error loading settings. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await SettingsService.saveSettings(settings);
      initialSettings.current = JSON.parse(JSON.stringify(settings)); // Update reset point
      setSnackbar({
        open: true,
        message: "Settings saved successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: "Error saving settings. Please try again.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (initialSettings.current) {
      setSettings(JSON.parse(JSON.stringify(initialSettings.current)));
      setSnackbar({
        open: true,
        message: "Settings reset to last saved state.",
        severity: "info",
      });
    }
  };

  const handleTestEmail = () => {
    // Pre-fill with admin email if available
    if (settings?.general?.adminEmail) {
      setTestEmailAddress(settings.general.adminEmail);
    }
    setTestEmailDialogOpen(true);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address.",
        severity: "warning",
      });
      return;
    }

    setActionInProgress(true);
    try {
      await SettingsService.sendTestEmail(testEmailAddress);
      setTestEmailDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Test email sent to ${testEmailAddress}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      setSnackbar({
        open: true,
        message: "Failed to send test email. Please check SMTP settings.",
        severity: "error",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const openConfirmDialog = (action, title, message) => {
    setConfirmAction(() => action);
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setActionInProgress(true);
    try {
      await confirmAction();
      setSnackbar({
        open: true,
        message: "Operation completed successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error executing action:", error);
      setSnackbar({
        open: true,
        message: "Failed to complete operation. Please try again.",
        severity: "error",
      });
    } finally {
      setActionInProgress(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleCreateBackup = () => {
    openConfirmDialog(
      SettingsService.createBackup,
      "Create System Backup",
      "This will create a complete backup of the system. It might take a few minutes. Do you want to continue?"
    );
  };

  const handleOptimizeDatabase = () => {
    openConfirmDialog(
      SettingsService.optimizeDatabase,
      "Optimize Database",
      "This will optimize the database tables. The system might be slower during this operation. Do you want to continue?"
    );
  };

  const handleClearCache = () => {
    openConfirmDialog(
      SettingsService.clearCache,
      "Clear System Cache",
      "This will clear all temporary files and caches. This might temporarily affect system performance. Continue?"
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">System Settings</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ mr: 2 }}
            onClick={handleResetSettings}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="System Name"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      handleSettingsChange(
                        "general",
                        "siteName",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Admin Email"
                    value={settings.general.adminEmail}
                    onChange={(e) =>
                      handleSettingsChange(
                        "general",
                        "adminEmail",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.general.timezone}
                      label="Timezone"
                      onChange={(e) =>
                        handleSettingsChange(
                          "general",
                          "timezone",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="Africa/Casablanca">
                        Africa/Casablanca
                      </MenuItem>
                      <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.general.language}
                      label="Language"
                      onChange={(e) =>
                        handleSettingsChange(
                          "general",
                          "language",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ar">العربية</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.general.dateFormat}
                      label="Date Format"
                      onChange={(e) =>
                        handleSettingsChange(
                          "general",
                          "dateFormat",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      value={settings.general.timeFormat}
                      label="Time Format"
                      onChange={(e) =>
                        handleSettingsChange(
                          "general",
                          "timeFormat",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="24h">24-hour (14:30)</MenuItem>
                      <MenuItem value="12h">12-hour (2:30 PM)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <SecurityIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Password Length"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      handleSettingsChange(
                        "security",
                        "passwordMinLength",
                        parseInt(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 6, max: 32 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Session Timeout (minutes)"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      handleSettingsChange(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 5, max: 1440 } }}
                    helperText="Set to 0 for no timeout"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Login Attempts"
                    value={settings.security.loginAttempts}
                    onChange={(e) =>
                      handleSettingsChange(
                        "security",
                        "loginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 3, max: 10 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordRequireUppercase}
                        onChange={(e) =>
                          handleSettingsChange(
                            "security",
                            "passwordRequireUppercase",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require Uppercase Letters in Passwords"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordRequireNumbers}
                        onChange={(e) =>
                          handleSettingsChange(
                            "security",
                            "passwordRequireNumbers",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require Numbers in Passwords"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordRequireSymbols}
                        onChange={(e) =>
                          handleSettingsChange(
                            "security",
                            "passwordRequireSymbols",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require Special Characters in Passwords"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) =>
                          handleSettingsChange(
                            "security",
                            "twoFactorAuth",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Email Settings</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    value={settings.email.smtpServer}
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "smtpServer",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="SMTP Port"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "smtpPort",
                        parseInt(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 1, max: 65535 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Username"
                    value={settings.email.smtpUsername}
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "smtpUsername",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="SMTP Password"
                    value="********" // For security reasons, don't show the actual password
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "smtpPassword",
                        e.target.value
                      )
                    }
                    helperText="Leave as is to keep current password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender Name"
                    value={settings.email.senderName}
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "senderName",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender Email"
                    value={settings.email.senderEmail}
                    onChange={(e) =>
                      handleSettingsChange(
                        "email",
                        "senderEmail",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.smtpSecure}
                        onChange={(e) =>
                          handleSettingsChange(
                            "email",
                            "smtpSecure",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Use SSL/TLS for SMTP"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleTestEmail}
                  >
                    Send Test Email
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <NotificationsIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Notification Settings</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notify On:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.operationCreated}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "operationCreated",
                            e.target.checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    }
                    label="Operation Created"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.operationUpdated}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "operationUpdated",
                            e.target.checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    }
                    label="Operation Updated"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.escaleCreated}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "escaleCreated",
                            e.target.checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    }
                    label="Escale Created"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.userAccountCreated}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "userAccountCreated",
                            e.target.checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    }
                    label="User Account Created"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.systemErrors}
                        onChange={(e) =>
                          handleSettingsChange(
                            "notifications",
                            "systemErrors",
                            e.target.checked
                          )
                        }
                        disabled={!settings.notifications.emailNotifications}
                      />
                    }
                    label="System Errors"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Backup Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <StorageIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Backup & Maintenance</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.backup.autoBackup}
                        onChange={(e) =>
                          handleSettingsChange(
                            "backup",
                            "autoBackup",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable Automatic Backups"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!settings.backup.autoBackup}>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value={settings.backup.backupFrequency}
                      label="Backup Frequency"
                      onChange={(e) =>
                        handleSettingsChange(
                          "backup",
                          "backupFrequency",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Backup Time"
                    type="time"
                    value={settings.backup.backupTime}
                    onChange={(e) =>
                      handleSettingsChange(
                        "backup",
                        "backupTime",
                        e.target.value
                      )
                    }
                    disabled={!settings.backup.autoBackup}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Retention Period (days)"
                    value={settings.backup.retentionDays}
                    onChange={(e) =>
                      handleSettingsChange(
                        "backup",
                        "retentionDays",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!settings.backup.autoBackup}
                    InputProps={{ inputProps: { min: 1, max: 365 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Backup Storage Location"
                    value={settings.backup.backupLocation}
                    onChange={(e) =>
                      handleSettingsChange(
                        "backup",
                        "backupLocation",
                        e.target.value
                      )
                    }
                    disabled={!settings.backup.autoBackup}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Manual Backup & Maintenance
                  </Typography>
                  <Box
                    sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<SystemUpdateIcon />}
                      onClick={handleCreateBackup}
                    >
                      Create Backup Now
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleOptimizeDatabase}
                    >
                      Optimize Database
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClearCache}
                    >
                      Clear Cache
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Test Email Dialog */}
      <Dialog
        open={testEmailDialogOpen}
        onClose={() => setTestEmailDialogOpen(false)}
      >
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will send a test email using your configured SMTP settings.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Email"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendTestEmail}
            variant="contained"
            color="primary"
            disabled={actionInProgress}
          >
            {actionInProgress ? "Sending..." : "Send Test Email"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color="primary"
            disabled={actionInProgress}
          >
            {actionInProgress ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;
