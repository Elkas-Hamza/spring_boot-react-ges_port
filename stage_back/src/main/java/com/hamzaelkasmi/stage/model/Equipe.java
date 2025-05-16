package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "equipe")
public class Equipe {
    @Id
    @GeneratedValue(generator = "equipe-id-generator")
    @GenericGenerator(
            name = "equipe-id-generator",
            strategy = "com.hamzaelkasmi.stage.generateure.EquipeIdGenerator"
    )
    @Column(name = "ID_equipe", nullable = false, unique = true)
    private String id_equipe;

    @Column(name = "NOM_equipe", nullable = false, length = 100)
    private String nom_equipe;    @ManyToMany
    @JoinTable(
        name = "equipe_has_personnel",
        joinColumns = @JoinColumn(name = "equipe_ID_equipe"),
        inverseJoinColumns = {
            @JoinColumn(name = "personnel_ID_personnel", referencedColumnName = "ID_personnel"),
            @JoinColumn(name = "personnel_MATRICULE_personnel", referencedColumnName = "MATRICULE_personnel")
        }
    )
    private Set<Personnel> personnel = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "equipe_has_soustraiteure",
        joinColumns = @JoinColumn(name = "equipe_ID_equipe"),
        inverseJoinColumns = @JoinColumn(name = "soustraiteure_MATRICULE_soustraiteure", referencedColumnName = "MATRICULE_soustraiteure")
    )
    private Set<Soustraiteure> soustraiteurs = new HashSet<>();

    // Constructors
    public Equipe() {
    }

    public Equipe(String nom_equipe) {
        this.nom_equipe = nom_equipe;
    }

    // Getters and Setters
    public String getId_equipe() {
        return id_equipe;
    }

    public void setId_equipe(String id_equipe) {
        this.id_equipe = id_equipe;
    }

    public String getNom_equipe() {
        return nom_equipe;
    }

    public void setNom_equipe(String nom_equipe) {
        this.nom_equipe = nom_equipe;
    }

    public Set<Personnel> getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Set<Personnel> personnel) {
        this.personnel = personnel;
    }

    public Set<Soustraiteure> getSoustraiteurs() {
        return soustraiteurs;
    }

    public void setSoustraiteurs(Set<Soustraiteure> soustraiteurs) {
        this.soustraiteurs = soustraiteurs;
    }

    // Helper methods for managing relationships
    public void addPersonnel(Personnel member) {
        personnel.add(member);
    }

    public void removePersonnel(Personnel member) {
        personnel.remove(member);
    }

    public void addSoustraiteur(Soustraiteure sousTraiteur) {
        soustraiteurs.add(sousTraiteur);
    }

    public void removeSoustraiteur(Soustraiteure sousTraiteur) {
        soustraiteurs.remove(sousTraiteur);
    }

    @Override
    public String toString() {
        return "Equipe{" +
                "id_equipe='" + id_equipe + '\'' +
                ", nom_equipe='" + nom_equipe + '\'' +
                '}';
    }
}