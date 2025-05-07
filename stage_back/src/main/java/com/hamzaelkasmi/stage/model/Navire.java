package com.hamzaelkasmi.stage.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import org.hibernate.annotations.GenericGenerator;

import java.util.Objects;

@Entity
@Table(name = "navire")
public class Navire {
    
    @Id
    @GeneratedValue(generator = "navire-id")
    @GenericGenerator(name = "navire-id", strategy = "com.hamzaelkasmi.stage.generateure.NavireIdGenerator")
    @Column(name = "ID_navire")
    private String idNavire;
    
    @Column(name = "NOM_navire", nullable = false)
    private String nomNavire;
    
    @Column(name = "MATRICULE_navire", nullable = false, unique = true)
    private String matriculeNavire;
    
    @Column(name = "ID_conteneure")
    private String idConteneure;
    
    // Default constructor
    public Navire() {
    }
    
    // Constructor with fields (removing idNavire since it will be generated)
    public Navire(String nomNavire, String matriculeNavire, String idConteneure) {
        this.nomNavire = nomNavire;
        this.matriculeNavire = matriculeNavire;
        this.idConteneure = idConteneure;
    }
    
    // Getters and Setters
    public String getIdNavire() {
        return idNavire;
    }
    
    public void setIdNavire(String idNavire) {
        this.idNavire = idNavire;
    }
    
    public String getNomNavire() {
        return nomNavire;
    }
    
    public void setNomNavire(String nomNavire) {
        this.nomNavire = nomNavire;
    }
    
    public String getMatriculeNavire() {
        return matriculeNavire;
    }
    
    public void setMatriculeNavire(String matriculeNavire) {
        this.matriculeNavire = matriculeNavire;
    }
    
    public String getIdConteneure() {
        return idConteneure;
    }
    
    public void setIdConteneure(String idConteneure) {
        this.idConteneure = idConteneure;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Navire navire = (Navire) o;
        return Objects.equals(idNavire, navire.idNavire);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(idNavire);
    }
    
    @Override
    public String toString() {
        return "Navire{" +
                "idNavire='" + idNavire + '\'' +
                ", nomNavire='" + nomNavire + '\'' +
                ", matriculeNavire='" + matriculeNavire + '\'' +
                ", idConteneure='" + idConteneure + '\'' +
                '}';
    }
} 