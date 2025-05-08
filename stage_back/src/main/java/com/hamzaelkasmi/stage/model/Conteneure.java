package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
    
    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE_conteneure")
    private ConteneureLocationType type_conteneure = ConteneureLocationType.TERRE;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_type")
    private TypeConteneur typeConteneur;
    
    @ManyToOne
    @JoinColumn(name = "ID_navire")
    @JsonBackReference
    private Navire navire;
    
    @Column(name = "DATE_AJOUT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateAjout;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DERNIERE_OPERATION")
    private Operation derniereOperation;

    // Enum for container location type
    public enum ConteneureLocationType {
        TERRE,
        NAVIRE
    }

    // Constructors
    public Conteneure() {
        this.dateAjout = new Date();
        this.type_conteneure = ConteneureLocationType.TERRE;
    }

    public Conteneure(String nom_conteneure, ConteneureLocationType type_conteneure) {
        this();
        this.nom_conteneure = nom_conteneure;
        this.type_conteneure = type_conteneure;
    }
    
    public Conteneure(String nom_conteneure, ConteneureLocationType type_conteneure, TypeConteneur typeConteneur, Navire navire) {
        this();
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
    
    public ConteneureLocationType getType_conteneure() {
        return type_conteneure;
    }

    public void setType_conteneure(ConteneureLocationType type_conteneure) {
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
    
    public Date getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(Date dateAjout) {
        this.dateAjout = dateAjout;
    }
    
    public Operation getDerniereOperation() {
        return derniereOperation;
    }

    public void setDerniereOperation(Operation derniereOperation) {
        this.derniereOperation = derniereOperation;
    }
    
    // Helper method to check if this is a ship container
    public boolean isShipContainer() {
        return this.type_conteneure == ConteneureLocationType.NAVIRE;
    }
    
    // Helper method to check if this is a land container
    public boolean isLandContainer() {
        return this.type_conteneure == ConteneureLocationType.TERRE;
    }

    @Override
    public String toString() {
        return "Conteneure{" +
                "id_conteneure='" + id_conteneure + '\'' +
                ", nom_conteneure='" + nom_conteneure + '\'' +
                ", type_conteneure='" + type_conteneure + '\'' +
                ", typeConteneur=" + (typeConteneur != null ? typeConteneur.getNomType() : "null") +
                ", navire=" + (navire != null ? navire.getNomNavire() : "null") +
                ", dateAjout=" + dateAjout +
                ", derniereOperation=" + (derniereOperation != null ? derniereOperation.getId_operation() : "null") +
                '}';
    }
} 