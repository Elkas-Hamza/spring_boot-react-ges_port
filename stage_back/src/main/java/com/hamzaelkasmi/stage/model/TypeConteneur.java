package com.hamzaelkasmi.stage.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Objects;

@Entity
@Table(name = "type_conteneur")
public class TypeConteneur {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_type")
    private Integer idType;
    
    @Column(name = "NOM_type", nullable = false, unique = true)
    private String nomType;
    
    @Column(name = "DESCRIPTION")
    private String description;
    
    // Default constructor
    public TypeConteneur() {
    }
    
    // Constructor with fields
    public TypeConteneur(Integer idType, String nomType, String description) {
        this.idType = idType;
        this.nomType = nomType;
        this.description = description;
    }
    
    // Getters and Setters
    public Integer getIdType() {
        return idType;
    }
    
    public void setIdType(Integer idType) {
        this.idType = idType;
    }
    
    public String getNomType() {
        return nomType;
    }
    
    public void setNomType(String nomType) {
        this.nomType = nomType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TypeConteneur that = (TypeConteneur) o;
        return Objects.equals(idType, that.idType);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(idType);
    }
    
    @Override
    public String toString() {
        return "TypeConteneur{" +
                "idType=" + idType +
                ", nomType='" + nomType + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 