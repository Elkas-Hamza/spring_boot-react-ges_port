package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;
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
    
    @OneToMany(mappedBy = "navire", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Conteneure> conteneurs;
    
    // Default constructor
    public Navire() {
    }
    
    // Constructor with fields (removing idNavire since it will be generated)
    public Navire(String nomNavire, String matriculeNavire) {
        this.nomNavire = nomNavire;
        this.matriculeNavire = matriculeNavire;
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
    
    public List<Conteneure> getConteneurs() {
        return conteneurs;
    }
    
    public void setConteneurs(List<Conteneure> conteneurs) {
        this.conteneurs = conteneurs;
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
                '}';
    }
} 