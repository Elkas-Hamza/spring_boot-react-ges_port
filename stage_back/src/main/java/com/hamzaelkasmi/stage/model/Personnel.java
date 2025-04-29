package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "personnel")
public class Personnel {
    @Id
    @Column(name = "MATRICULE_personnel", nullable = false)
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid2")
    private String MATRICULE_personnel;

    @Column(name = "NOM_personnel", nullable = false, length = 45)
    private String NOM_personnel;

    @Column(name = "PRENOM_personnel", nullable = false, length = 45)
    private String PRENOM_personnel;

    @Column(name = "FONCTION_personnel", nullable = false, length = 45)
    private String FONCTION_personnel;

    // Constructors
    public Personnel() {
    }

    public Personnel(String NOM_personnel, String PRENOM_personnel, String FONCTION_personnel) {
        this.NOM_personnel = NOM_personnel;
        this.PRENOM_personnel = PRENOM_personnel;
        this.FONCTION_personnel = FONCTION_personnel;
    }

    // Constructor with matricule (for updates)
    public Personnel(String MATRICULE_personnel, String NOM_personnel, String PRENOM_personnel, String FONCTION_personnel) {
        this.MATRICULE_personnel = MATRICULE_personnel;
        this.NOM_personnel = NOM_personnel;
        this.PRENOM_personnel = PRENOM_personnel;
        this.FONCTION_personnel = FONCTION_personnel;
    }

    // Getters and Setters
    public String getMATRICULE_personnel() {
        return MATRICULE_personnel;
    }
    
    public void setMATRICULE_personnel(String MATRICULE_personnel) {
        this.MATRICULE_personnel = MATRICULE_personnel;
    }

    public String getNOM_personnel() {
        return NOM_personnel;
    }

    public void setNOM_personnel(String NOM_personnel) {
        this.NOM_personnel = NOM_personnel;
    }

    public String getPRENOM_personnel() {
        return PRENOM_personnel;
    }

    public void setPRENOM_personnel(String PRENOM_personnel) {
        this.PRENOM_personnel = PRENOM_personnel;
    }

    public String getFONCTION_personnel() {
        return FONCTION_personnel;
    }

    public void setFONCTION_personnel(String FONCTION_personnel) {
        this.FONCTION_personnel = FONCTION_personnel;
    }

    // toString method
    @Override
    public String toString() {
        return "Personnel{" +
                "MATRICULE_personnel='" + MATRICULE_personnel + '\'' +
                ", NOM_personnel='" + NOM_personnel + '\'' +
                ", PRENOM_personnel='" + PRENOM_personnel + '\'' +
                ", FONCTION_personnel='" + FONCTION_personnel + '\'' +
                '}';
    }
}