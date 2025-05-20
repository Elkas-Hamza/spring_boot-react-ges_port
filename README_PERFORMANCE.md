# Performance Monitoring System

This document outlines the performance monitoring features available in the application.

## Frontend Features

The application includes a comprehensive performance monitoring dashboard that provides insights into:

- API response times
- Error rates by endpoint
- System resource usage (CPU, memory, disk)
- Real-time server metrics with live updates
- Active connection tracking
- Real-time alerts for slow responses
- Historical performance trends

## Backend Implementation

The backend provides the following monitoring endpoints:

### Endpoints

All performance monitoring endpoints are under the `/api/monitoring` base path:

- `GET /api/monitoring/system-metrics`: Returns current system metrics including CPU, memory, disk, and uptime
- `GET /api/monitoring/performance-metrics`: Returns aggregated API performance metrics
- `GET /api/monitoring/alerts`: Returns performance alerts
- `DELETE /api/monitoring/alerts`: Clears all performance alerts
- `GET /api/monitoring/status`: Gets monitoring enablement status
- `POST /api/monitoring/status`: Enables or disables monitoring

### Usage

The frontend automatically connects to these endpoints when the performance monitoring feature is enabled from the UI.

## How to Use

1. Navigate to the Performance Monitoring section in the application
2. Toggle the monitoring switch to enable performance tracking
3. View real-time performance data in the dashboard
4. Check alerts for performance issues
5. Use the metrics to identify slow endpoints or system resource constraints

## Implementation Details

### Backend

The system uses several components:

- `PerformanceMonitoringService`: Core service that collects and analyzes metrics
- `PerformanceInterceptor`: Spring MVC interceptor that tracks API call performance
- `WebMvcConfig`: Configuration to register the interceptor
- `PerformanceMonitoringController`: REST controller exposing monitoring endpoints

### Frontend

The frontend implementation includes:

- `PerformanceService`: Service that communicates with the backend API
- `PerformanceMonitor`: React component that displays the monitoring dashboard
- Axios interceptors to track API call performance on the client side

## Performance Impact

The monitoring system is designed to have minimal impact on application performance:

- Backend monitoring can be enabled/disabled at runtime
- Data collection is optimized for low overhead
- Scheduled cleanup jobs prevent memory leaks from accumulated metrics

## Security Considerations

Access to the monitoring endpoints should be restricted to authorized users only.

## Real-Time Server Metrics

The application now features a robust real-time server monitoring system:

### System Metrics

The following metrics are collected and displayed in real-time:

- **CPU Usage**: Current processor utilization as a percentage
- **Memory Usage**: Current memory utilization as a percentage
- **Disk Usage**: Storage space utilization with used/total values
- **Active Connections**: Real-time count of active HTTP connections
- **Server Uptime**: Duration since application startup

### How It Works

1. **Backend Collection**: 
   - Uses Java Management Extensions (JMX) to collect CPU and memory metrics
   - Tracks file system information for disk space metrics
   - Intercepts HTTP requests to count active connections

2. **Periodic Updates**:
   - Frontend polls the backend every 3 seconds for the latest metrics
   - Values are displayed with visual indicators (progress bars, status chips)
   - Historical data is stored for trend analysis

3. **Cross-Origin Support**:
   - Configured to work with both local development and production deployments
   - Supports HTTPS connections from the Vercel-hosted frontend

### User Interface

The monitoring dashboard provides:

- Visual progress bars for CPU, memory, and disk usage
- Color-coded indicators based on usage thresholds (green, orange, red)
- Connection status indicators
- Manual refresh option for immediate updates
- Last updated timestamp

### Implementation

The monitoring is implemented using:
- Backend: Spring Boot's actuator framework with custom metrics
- Frontend: React with Material-UI components
- Data fetching: Axios with interceptors for connection tracking
