import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import AnalyticsService from '../../services/AnalyticsService';
import AuthService from '../../services/AuthService';
import {
  TrendingUp,
  People,
  DirectionsBoat,
  AssessmentOutlined,
  Schedule,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  DonutLarge,
  AvTimer
} from '@mui/icons-material';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [testConnection, setTestConnection] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const result = await AnalyticsService.testApiConnection();
        setTestConnection(result);
        console.log('API Test successful:', result);
      } catch (err) {
        console.error('API Test failed:', err);
        setTestConnection('Connection failed');
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        // First test the connection
        await testApi();
        
        // Now try to get the actual data
        const tokenInfo = AuthService.getTokenDebugInfo();
        console.log('Token debug info:', tokenInfo);
        
        const data = await AnalyticsService.getAllAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        if (err.response) {
          console.log('Error status:', err.response.status);
          console.log('Error data:', err.response.data);
        }
        
        // Check token validity
        const tokenInfo = AuthService.getTokenDebugInfo();
        if (!tokenInfo.exists) {
          setError('Authentication error: No token found. Please login again.');
        } else if (tokenInfo.expired) {
          setError('Authentication error: Token has expired. Please login again.');
        } else if (!tokenInfo.valid) {
          setError(`Authentication error: Invalid token. ${tokenInfo.message}`);
        } else {
          setError('Failed to load analytics data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleYearChange = (event) => {
    setYearFilter(event.target.value);
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

  if (error) {
    const tokenInfo = AuthService.getTokenDebugInfo();
    
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Paper
          elevation={3}
          sx={{ padding: 3, maxWidth: 550, textAlign: 'center' }}
        >
          <ErrorOutlineOutlined color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1">{error}</Typography>
          
          {testConnection && (
            <Box mt={2} p={1} bgcolor={testConnection === 'Connection failed' ? '#ffebee' : '#e8f5e9'} borderRadius={1}>
              <Typography variant="body2">
                API Test: {typeof testConnection === 'string' ? testConnection : 'Connection successful'}
              </Typography>
            </Box>
          )}
          
          <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1} textAlign="left">
            <Typography variant="subtitle2" gutterBottom>
              Authentication Debug Info:
            </Typography>
            <Typography variant="body2">
              Token exists: {tokenInfo.exists ? 'Yes' : 'No'}
            </Typography>
            {tokenInfo.exists && (
              <>
                <Typography variant="body2">
                  Valid: {tokenInfo.valid ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Expired: {tokenInfo.expired ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Issued: {tokenInfo.issueTime}
                </Typography>
                <Typography variant="body2">
                  Expires: {tokenInfo.expireTime}
                </Typography>
                <Typography variant="body2">
                  User: {tokenInfo.subject}
                </Typography>
                <Typography variant="body2">
                  Roles: {tokenInfo.roles ? JSON.stringify(tokenInfo.roles) : 'None'}
                </Typography>
              </>
            )}
          </Box>
          
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                AuthService.logout();
                window.location.href = '/';
              }}
            >
              Logout & Login Again
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Port Operations Analytics
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Total Operations
                  </Typography>
                  <Typography variant="h4">
                    {analytics.summary.totalOperations}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <CheckCircleOutlineOutlined sx={{ color: 'green', mr: 1 }} />
                <Typography variant="body2">
                  {analytics.summary.completedOperations} completed ({Math.round((analytics.summary.completedOperations / analytics.summary.totalOperations) * 100)}%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DirectionsBoat color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Total Escales
                  </Typography>
                  <Typography variant="h4">
                    {analytics.summary.totalEscales}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <DonutLarge sx={{ color: 'orange', mr: 1 }} />
                <Typography variant="body2">
                  {analytics.summary.activeEscales} active now
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Equipes
                  </Typography>
                  <Typography variant="h4">
                    {analytics.summary.totalEquipes}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <AssessmentOutlined sx={{ color: 'blue', mr: 1 }} />
                <Typography variant="body2">
                  {analytics.summary.totalPersonnel} personnel total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AvTimer color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Avg. Duration
                  </Typography>
                  <Typography variant="h4">
                    {analytics.operationDurations.averageDuration} min
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <Schedule sx={{ color: 'purple', mr: 1 }} />
                <Typography variant="body2">
                  Median: {analytics.operationDurations.medianDuration} min
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Operations" />
          <Tab label="Performance" />
          <Tab label="Port Utilization" />
          <Tab label="Recent Escales" />
        </Tabs>
      </Box>

      {/* Operations Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operations by Type
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.operationsByType.map((type) => {
                        const percentage = (type.count / analytics.summary.totalOperations) * 100;
                        return (
                          <TableRow key={type.type}>
                            <TableCell>{type.type}</TableCell>
                            <TableCell align="right">{type.count}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    color="primary"
                                    sx={{ height: 10, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${Math.round(percentage)}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Operations by Month
                  </Typography>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="year-select-label">Year</InputLabel>
                    <Select
                      labelId="year-select-label"
                      id="year-select"
                      value={yearFilter}
                      label="Year"
                      onChange={handleYearChange}
                      size="small"
                    >
                      <MenuItem value={2025}>2025</MenuItem>
                      <MenuItem value={2024}>2024</MenuItem>
                      <MenuItem value={2023}>2023</MenuItem>
                      <MenuItem value={2022}>2022</MenuItem>
                      <MenuItem value={2021}>2021</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Operations</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.operationsByMonth.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell align="right">{month.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operation Durations
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration Range</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.operationDurations.durations.map((duration) => {
                        const percentage = (duration.count / analytics.summary.totalOperations) * 100;
                        return (
                          <TableRow key={duration.range}>
                            <TableCell>{duration.range}</TableCell>
                            <TableCell align="right">{duration.count}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    color="success"
                                    sx={{ height: 10, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${Math.round(percentage)}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Performance Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Equipes by Operations
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Equipe</TableCell>
                        <TableCell align="right">Operations</TableCell>
                        <TableCell align="right">Efficiency Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topEquipesByOperations.map((equipe) => (
                        <TableRow key={equipe.equipe}>
                          <TableCell>{equipe.equipe}</TableCell>
                          <TableCell align="right">{equipe.operations}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={equipe.efficiency}
                                  color={equipe.efficiency > 90 ? "success" : "primary"}
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${Math.round(equipe.efficiency)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personnel Utilization by Department
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Utilization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.personnelUtilization.byDepartment.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell>{dept.department}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={dept.utilization}
                                  color={dept.utilization > 85 ? "success" : "primary"}
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${dept.utilization}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Port Utilization Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Port Utilization
                  </Typography>
                  <Chip 
                    color={analytics.portUtilization.currentOccupancy > 0.8 ? "error" : "success"} 
                    label={`Current: ${Math.round(analytics.portUtilization.currentOccupancy * 100)}%`} 
                  />
                </Box>
                <Box mt={3} mb={3}>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.portUtilization.currentOccupancy * 100}
                    color={analytics.portUtilization.currentOccupancy > 0.8 ? "error" : 
                          analytics.portUtilization.currentOccupancy > 0.7 ? "warning" : "success"}
                    sx={{ height: 20, borderRadius: 5 }}
                  />
                  <Typography variant="body2" align="center" mt={1}>
                    {analytics.portUtilization.occupiedSlots} of {analytics.portUtilization.totalSlots} slots occupied
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom mt={4}>
                  Utilization by Zone
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Zone</TableCell>
                        <TableCell align="right">Utilization</TableCell>
                        <TableCell align="right">Available</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.portUtilization.byZone.map((zone) => (
                        <TableRow key={zone.zone}>
                          <TableCell>{zone.zone}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={zone.utilization * 100}
                                  color={zone.utilization > 0.8 ? "error" : zone.utilization > 0.7 ? "warning" : "success"}
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${Math.round(zone.utilization * 100)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{zone.available}</TableCell>
                          <TableCell align="right">{zone.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Escales Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Vessel Calls (Escales)
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Navire</TableCell>
                        <TableCell>Arrival</TableCell>
                        <TableCell>Departure</TableCell>
                        <TableCell align="right">Operations</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.recentEscales.map((escale) => (
                        <TableRow key={escale.id}>
                          <TableCell>{escale.id}</TableCell>
                          <TableCell>{escale.navire}</TableCell>
                          <TableCell>{escale.arrival}</TableCell>
                          <TableCell>{escale.departure || 'In Port'}</TableCell>
                          <TableCell align="right">{escale.operations}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small"
                              label={escale.departure ? 'Completed' : 'Active'}
                              color={escale.departure ? 'success' : 'primary'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsDashboard; 