package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "personnel")
public class Personnel {
    @Id
    @Column(name = "MATRICULE_personnel", nullable = false)
    @GeneratedValue(generator = "personnel-id-generator")
    @GenericGenerator(name = "personnel-id-generator", strategy = "com.hamzaelkasmi.stage.generateure.PersonnelIdGenerator")
    @JsonProperty("matricule_personnel")
    private String MATRICULE_personnel;

    @Column(name = "ID_personnel", nullable = false)
    @JsonProperty("id_personnel")
    private Integer ID_personnel;

    @Column(name = "NOM_personnel", nullable = false, length = 45)
    @JsonProperty("nom_personnel")
    private String NOM_personnel;

    @Column(name = "PRENOM_personnel", nullable = false, length = 45)
    @JsonProperty("prenom_personnel")
    private String PRENOM_personnel;

    @Column(name = "FONCTION_personnel", nullable = false, length = 45)
    @JsonProperty("fonction_personnel")
    private String FONCTION_personnel;

    @Column(name = "CONTACT_personnel", length = 45)
    @JsonProperty("contact_personnel")
    private String CONTACT_personnel;

    // Constructors
    public Personnel() {
        // Default constructor required by JPA/Hibernate
    }

    public Personnel(String MATRICULE_personnel, String NOM_personnel, String PRENOM_personnel,
            String FONCTION_personnel, String CONTACT_personnel) {
        this.MATRICULE_personnel = MATRICULE_personnel;
        this.NOM_personnel = NOM_personnel;
        this.PRENOM_personnel = PRENOM_personnel;
        this.FONCTION_personnel = FONCTION_personnel;
        this.CONTACT_personnel = CONTACT_personnel;
    } // Getters and Setters

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

    public String getCONTACT_personnel() {
        return CONTACT_personnel;
    }

    public void setCONTACT_personnel(String CONTACT_personnel) {
        this.CONTACT_personnel = CONTACT_personnel;
    } // toString method

    @Override
    public String toString() {
        return "Personnel{" +
                "ID_personnel=" + ID_personnel +
                ", MATRICULE_personnel='" + MATRICULE_personnel + '\'' +
                ", NOM_personnel='" + NOM_personnel + '\'' +
                ", PRENOM_personnel='" + PRENOM_personnel + '\'' +
                ", FONCTION_personnel='" + FONCTION_personnel + '\'' +
                ", CONTACT_personnel='" + CONTACT_personnel + '\'' +
                '}';
    }
}