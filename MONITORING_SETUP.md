# Performance Monitoring System Setup Guide

This guide explains how to set up and use the performance monitoring system in your application. The system has been enhanced to show real-time server performance metrics.

## Backend Setup

### 1. Dependencies

Make sure you have these dependencies in your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 2. Configuration

Add these properties to your `performance.properties` file:

```properties
performance.monitoring.enabled=false
performance.monitoring.max-data-points=100
performance.monitoring.alert-threshold-ms=5000
performance.monitoring.cleanup-interval-minutes=60
```

### 3. Add @EnableScheduling

Make sure your main application class includes:

```java
@SpringBootApplication
@EnableScheduling
public class YourApplication {
    // ...
}
```

## Frontend Setup

### 1. Integration with PerformanceService

The `PerformanceService.js` connects to the backend API endpoints:

- `/api/monitoring/system-metrics` - System resource usage
- `/api/monitoring/performance-metrics` - API performance data
- `/api/monitoring/alerts` - Alerts for slow API calls
- `/api/monitoring/status` - Toggle monitoring on/off
- `/api/monitoring/health` - System health check

### 2. Available Components

- `PerformanceMonitor` - Displays API metrics dashboard
- `SystemHealthCheck` - Shows system resource usage
- `MonitoringDashboard` - Container with tabs for different monitoring views

## Usage

### For Backend Developers

1. The `PerformanceInterceptor` automatically tracks API call performance
2. `PerformanceMonitoringService` provides methods to record and analyze performance metrics
3. Customize alert thresholds in `performance.properties`

### For Frontend Developers

1. Import `SystemHealthCheck` or `MonitoringDashboard` for monitoring UI
2. Use `performanceService.enableMonitoring()` to activate monitoring
3. Use `performanceService.getMetrics()` to access performance data

## Data Collection

The monitoring system collects:

- API response times
- Error rates by endpoint
- CPU usage
- Memory usage
- Disk space utilization
- JVM uptime

## Security Considerations

This monitoring system exposes detailed system information. Ensure:

1. All monitoring endpoints are protected by proper authentication
2. Only administrators have access to the monitoring UI
3. Sensitive system information isn't logged or exposed publicly

## Real-Time Server Metrics

The system now displays real-time server metrics including:

### Backend Enhancements

1. **Active Connection Tracking**: The system now tracks HTTP connections in real-time
   - Connection counts are tracked via the `PerformanceInterceptor` 
   - Both active and total connections are monitored

2. **System Resource Monitoring**:
   - CPU usage percentage (real-time)
   - Memory utilization percentage
   - Disk space usage
   - Server uptime

### Frontend Display

- **Auto-Refreshing Metrics**: Server metrics are automatically fetched every 3 seconds
- **Manual Refresh**: You can force a refresh with the "Refresh Metrics" button
- **Visual Status Indicators**: Connection status is visually indicated
- **Resource Usage Bars**: CPU, memory and disk usage shown with color-coded progress bars

### Cross-Origin Access

The monitoring system has been configured to allow access from:
- Local development (http://localhost:3000)
- Deployed Vercel frontend (https://spring-boot-react-ges-port.vercel.app)

### Using the Real-Time Monitoring

1. Navigate to the Performance Monitoring page
2. View the "Real-Time Server Metrics" panel at the bottom
3. Monitor system resource usage as your application runs
4. Check connection status for remote deployments
