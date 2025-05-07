package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "conteneure")
public class Conteneure {
    @Id
    @GeneratedValue(generator = "conteneure-id")
    @GenericGenerator(name = "conteneure-id", strategy = "com.hamzaelkasmi.stage.generateure.ConteneureIdGenerator")
    @Column(name = "ID_conteneure")
    private String id_conteneure;

    @Column(name = "NOM_conteneure", nullable = false, length = 45)
    private String nom_conteneure;
    
    @Column(name = "TYPE_conteneure", length = 100)
    private String type_conteneure;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_type", nullable = false)
    private TypeConteneur typeConteneur;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MATRICULE_navire")
    private Navire navire;

    // Constructors
    public Conteneure() {
    }

    public Conteneure(String nom_conteneure, String type_conteneure) {
        this.nom_conteneure = nom_conteneure;
        this.type_conteneure = type_conteneure;
    }
    
    public Conteneure(String nom_conteneure, String type_conteneure, TypeConteneur typeConteneur, Navire navire) {
        this.nom_conteneure = nom_conteneure;
        this.type_conteneure = type_conteneure;
        this.typeConteneur = typeConteneur;
        this.navire = navire;
    }

    // Getters and Setters
    public String getId_conteneure() {
        return id_conteneure;
    }

    public void setId_conteneure(String id_conteneure) {
        this.id_conteneure = id_conteneure;
    }

    public String getNom_conteneure() {
        return nom_conteneure;
    }

    public void setNom_conteneure(String nom_conteneure) {
        this.nom_conteneure = nom_conteneure;
    }
    
    public String getType_conteneure() {
        return type_conteneure;
    }

    public void setType_conteneure(String type_conteneure) {
        this.type_conteneure = type_conteneure;
    }
    
    public TypeConteneur getTypeConteneur() {
        return typeConteneur;
    }

    public void setTypeConteneur(TypeConteneur typeConteneur) {
        this.typeConteneur = typeConteneur;
    }

    public Navire getNavire() {
        return navire;
    }

    public void setNavire(Navire navire) {
        this.navire = navire;
    }
    
    // Helper method to check if this is a ship container
    public boolean isShipContainer() {
        return this.typeConteneur != null && "NAVIRE".equals(this.typeConteneur.getNomType());
    }
    
    // Helper method to check if this is a land container
    public boolean isLandContainer() {
        return this.typeConteneur != null && "TERRE".equals(this.typeConteneur.getNomType());
    }

    @Override
    public String toString() {
        return "Conteneure{" +
                "id_conteneure='" + id_conteneure + '\'' +
                ", nom_conteneure='" + nom_conteneure + '\'' +
                ", type_conteneure='" + type_conteneure + '\'' +
                ", typeConteneur=" + (typeConteneur != null ? typeConteneur.getNomType() : "null") +
                ", navire=" + (navire != null ? navire.getNomNavire() : "null") +
                '}';
    }
} 