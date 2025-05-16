-- Fix for the composite key issue between personnel and equipe

-- First, add any missing auto-increment IDs to personnel table
UPDATE personnel p1, 
       (SELECT @row_num := @row_num + 1 as auto_id, MATRICULE_personnel
        FROM personnel, (SELECT @row_num := 0) r 
        WHERE ID_personnel IS NULL
        ORDER BY MATRICULE_personnel) p2
SET p1.ID_personnel = p2.auto_id
WHERE p1.MATRICULE_personnel = p2.MATRICULE_personnel AND p1.ID_personnel IS NULL;

-- Update equipe_has_personnel table with correct ID_personnel values
UPDATE equipe_has_personnel ehp
JOIN personnel p ON ehp.personnel_MATRICULE_personnel = p.MATRICULE_personnel
SET ehp.personnel_ID_personnel = p.ID_personnel
WHERE ehp.personnel_ID_personnel <> p.ID_personnel OR ehp.personnel_ID_personnel IS NULL;
