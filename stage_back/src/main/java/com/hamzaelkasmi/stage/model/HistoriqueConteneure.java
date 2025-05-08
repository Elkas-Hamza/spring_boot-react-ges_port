package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "historique_conteneure")
public class HistoriqueConteneure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_historique")
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_conteneure", nullable = false)
    private Conteneure conteneure;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "LOCATION_PRECEDENTE", nullable = false)
    private Conteneure.ConteneureLocationType locationPrecedente;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "LOCATION_NOUVELLE", nullable = false)
    private Conteneure.ConteneureLocationType locationNouvelle;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_navire_precedent")
    private Navire navirePrecedent;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_navire_nouveau")
    private Navire navireNouveau;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_operation_conteneure")
    private OperationConteneure operationConteneure;
    
    @Column(name = "DATE_mouvement")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateMouvement;
    
    @Column(name = "UTILISATEUR")
    private String utilisateur;
    
    // Constructors
    public HistoriqueConteneure() {
        this.dateMouvement = new Date();
    }
    
    public HistoriqueConteneure(Conteneure conteneure, 
                              Conteneure.ConteneureLocationType locationPrecedente, 
                              Conteneure.ConteneureLocationType locationNouvelle,
                              Navire navirePrecedent,
                              Navire navireNouveau,
                              OperationConteneure operationConteneure) {
        this();
        this.conteneure = conteneure;
        this.locationPrecedente = locationPrecedente;
        this.locationNouvelle = locationNouvelle;
        this.navirePrecedent = navirePrecedent;
        this.navireNouveau = navireNouveau;
        this.operationConteneure = operationConteneure;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Conteneure getConteneure() {
        return conteneure;
    }
    
    public void setConteneure(Conteneure conteneure) {
        this.conteneure = conteneure;
    }
    
    public Conteneure.ConteneureLocationType getLocationPrecedente() {
        return locationPrecedente;
    }
    
    public void setLocationPrecedente(Conteneure.ConteneureLocationType locationPrecedente) {
        this.locationPrecedente = locationPrecedente;
    }
    
    public Conteneure.ConteneureLocationType getLocationNouvelle() {
        return locationNouvelle;
    }
    
    public void setLocationNouvelle(Conteneure.ConteneureLocationType locationNouvelle) {
        this.locationNouvelle = locationNouvelle;
    }
    
    public Navire getNavirePrecedent() {
        return navirePrecedent;
    }
    
    public void setNavirePrecedent(Navire navirePrecedent) {
        this.navirePrecedent = navirePrecedent;
    }
    
    public Navire getNavireNouveau() {
        return navireNouveau;
    }
    
    public void setNavireNouveau(Navire navireNouveau) {
        this.navireNouveau = navireNouveau;
    }
    
    public OperationConteneure getOperationConteneure() {
        return operationConteneure;
    }
    
    public void setOperationConteneure(OperationConteneure operationConteneure) {
        this.operationConteneure = operationConteneure;
    }
    
    public Date getDateMouvement() {
        return dateMouvement;
    }
    
    public void setDateMouvement(Date dateMouvement) {
        this.dateMouvement = dateMouvement;
    }
    
    public String getUtilisateur() {
        return utilisateur;
    }
    
    public void setUtilisateur(String utilisateur) {
        this.utilisateur = utilisateur;
    }
    
    @Override
    public String toString() {
        return "HistoriqueConteneure{" +
                "id=" + id +
                ", conteneure=" + (conteneure != null ? conteneure.getId_conteneure() : "null") +
                ", locationPrecedente=" + locationPrecedente +
                ", locationNouvelle=" + locationNouvelle +
                ", navirePrecedent=" + (navirePrecedent != null ? navirePrecedent.getIdNavire() : "null") +
                ", navireNouveau=" + (navireNouveau != null ? navireNouveau.getIdNavire() : "null") +
                ", operationConteneure=" + (operationConteneure != null ? operationConteneure.getId_operation_conteneure() : "null") +
                ", dateMouvement=" + dateMouvement +
                ", utilisateur='" + utilisateur + '\'' +
                '}';
    }
} 