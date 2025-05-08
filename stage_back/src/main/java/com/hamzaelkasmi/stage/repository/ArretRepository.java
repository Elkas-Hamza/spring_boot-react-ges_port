package com.hamzaelkasmi.stage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.hamzaelkasmi.stage.model.Arret;
import java.util.List;
import java.util.Map;

@Repository
public interface ArretRepository extends JpaRepository<Arret, String> {
    @Query(value = "SELECT a.MOTIF_arret as reason, COUNT(a.ID_arret) as count, " +
                  "SUM(TIMESTAMPDIFF(HOUR, a.DATE_DEBUT_arret, a.DATE_FIN_arret)) as totalHours " +
                  "FROM arret a " +
                  "GROUP BY a.MOTIF_arret", 
          nativeQuery = true)
    List<Map<String, Object>> countAndSumHoursByReason();
}