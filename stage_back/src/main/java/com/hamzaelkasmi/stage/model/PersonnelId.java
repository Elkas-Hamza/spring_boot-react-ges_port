package com.hamzaelkasmi.stage.model;

import java.io.Serializable;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Composite key class for Personnel entity
 */
public class PersonnelId implements Serializable {
    @JsonProperty("id_personnel")
    private Integer ID_personnel;
    
    @JsonProperty("matricule_personnel")
    private String MATRICULE_personnel;
    
    public PersonnelId() {
    }
    
    public PersonnelId(Integer ID_personnel, String MATRICULE_personnel) {
        this.ID_personnel = ID_personnel;
        this.MATRICULE_personnel = MATRICULE_personnel;
    }
    
    public Integer getID_personnel() {
        return ID_personnel;
    }
    
    public void setID_personnel(Integer ID_personnel) {
        this.ID_personnel = ID_personnel;
    }
    
    public String getMATRICULE_personnel() {
        return MATRICULE_personnel;
    }
    
    public void setMATRICULE_personnel(String MATRICULE_personnel) {
        this.MATRICULE_personnel = MATRICULE_personnel;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersonnelId that = (PersonnelId) o;
        return Objects.equals(ID_personnel, that.ID_personnel) && 
               Objects.equals(MATRICULE_personnel, that.MATRICULE_personnel);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(ID_personnel, MATRICULE_personnel);
    }
}
