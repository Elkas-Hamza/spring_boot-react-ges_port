package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.ApiCallMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ApiCallMetricRepository extends JpaRepository<ApiCallMetric, Long> {
    
    List<ApiCallMetric> findByEndpoint(String endpoint);
      List<ApiCallMetric> findByMethod(String method);
      List<ApiCallMetric> findByTimestampBetween(Instant start, Instant end);
    
    @Query("SELECT a FROM ApiCallMetric a WHERE a.endpoint = ?1 AND a.timestamp BETWEEN ?2 AND ?3")
    List<ApiCallMetric> findByEndpointAndTimeRange(String endpoint, Instant start, Instant end);
    
    @Query("SELECT AVG(a.responseTime) FROM ApiCallMetric a WHERE a.endpoint = ?1 AND a.timestamp BETWEEN ?2 AND ?3")
    Double getAverageResponseTime(String endpoint, Instant start, Instant end);
    
    @Query("SELECT a.endpoint, AVG(a.responseTime) as avgDuration FROM ApiCallMetric a WHERE a.timestamp BETWEEN ?1 AND ?2 GROUP BY a.endpoint ORDER BY avgDuration DESC")
    List<Object[]> getSlowestEndpoints(Instant start, Instant end);
}
