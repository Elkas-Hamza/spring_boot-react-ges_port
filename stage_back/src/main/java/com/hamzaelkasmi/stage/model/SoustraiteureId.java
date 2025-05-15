package com.hamzaelkasmi.stage.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite key class for Soustraiteure entity
 */
public class SoustraiteureId implements Serializable {
    private Integer ID_soustraiteure;
    private String MATRICULE_soustraiteure;
    
    public SoustraiteureId() {
    }
    
    public SoustraiteureId(Integer ID_soustraiteure, String MATRICULE_soustraiteure) {
        this.ID_soustraiteure = ID_soustraiteure;
        this.MATRICULE_soustraiteure = MATRICULE_soustraiteure;
    }
    
    public Integer getID_soustraiteure() {
        return ID_soustraiteure;
    }
    
    public void setID_soustraiteure(Integer ID_soustraiteure) {
        this.ID_soustraiteure = ID_soustraiteure;
    }
    
    public String getMATRICULE_soustraiteure() {
        return MATRICULE_soustraiteure;
    }
    
    public void setMATRICULE_soustraiteure(String MATRICULE_soustraiteure) {
        this.MATRICULE_soustraiteure = MATRICULE_soustraiteure;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SoustraiteureId that = (SoustraiteureId) o;
        return Objects.equals(ID_soustraiteure, that.ID_soustraiteure) && 
               Objects.equals(MATRICULE_soustraiteure, that.MATRICULE_soustraiteure);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(ID_soustraiteure, MATRICULE_soustraiteure);
    }
}
