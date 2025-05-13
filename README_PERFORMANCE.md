# Performance Monitoring System

This document outlines the performance monitoring features available in the application.

## Frontend Features

The application includes a comprehensive performance monitoring dashboard that provides insights into:

- API response times
- Error rates by endpoint
- System resource usage (CPU, memory, disk)
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
