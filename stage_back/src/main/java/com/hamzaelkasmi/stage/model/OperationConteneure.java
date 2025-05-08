package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.Date;

@Entity
@Table(name = "operation_conteneure")
public class OperationConteneure {
    @Id
    @GeneratedValue(generator = "operation-conteneure-id")
    @GenericGenerator(name = "operation-conteneure-id", strategy = "com.hamzaelkasmi.stage.generateure.OperationConteneureIdGenerator")
    @Column(name = "ID_operation_conteneure")
    private String id_operation_conteneure;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_operation", nullable = false)
    private Operation operation;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_conteneure", nullable = false)
    private Conteneure conteneure;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE_OPERATION", nullable = false)
    private OperationType typeOperation;
    
    @Column(name = "DATE_OPERATION")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateOperation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private OperationStatus status = OperationStatus.EN_COURS;
    
    public enum OperationType {
        CHARGEMENT,
        DECHARGEMENT
    }
    
    public enum OperationStatus {
        EN_COURS,
        TERMINE,
        ANNULE
    }
    
    // Constructors
    public OperationConteneure() {
        this.dateOperation = new Date();
    }
    
    public OperationConteneure(Operation operation, Conteneure conteneure, OperationType typeOperation) {
        this();
        this.operation = operation;
        this.conteneure = conteneure;
        this.typeOperation = typeOperation;
    }
    
    // Getters and Setters
    public String getId_operation_conteneure() {
        return id_operation_conteneure;
    }
    
    public void setId_operation_conteneure(String id_operation_conteneure) {
        this.id_operation_conteneure = id_operation_conteneure;
    }
    
    public Operation getOperation() {
        return operation;
    }
    
    public void setOperation(Operation operation) {
        this.operation = operation;
    }
    
    public Conteneure getConteneure() {
        return conteneure;
    }
    
    public void setConteneure(Conteneure conteneure) {
        this.conteneure = conteneure;
    }
    
    public OperationType getTypeOperation() {
        return typeOperation;
    }
    
    public void setTypeOperation(OperationType typeOperation) {
        this.typeOperation = typeOperation;
    }
    
    public Date getDateOperation() {
        return dateOperation;
    }
    
    public void setDateOperation(Date dateOperation) {
        this.dateOperation = dateOperation;
    }
    
    public OperationStatus getStatus() {
        return status;
    }
    
    public void setStatus(OperationStatus status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "OperationConteneure{" +
                "id_operation_conteneure='" + id_operation_conteneure + '\'' +
                ", operation=" + (operation != null ? operation.getId_operation() : "null") +
                ", conteneure=" + (conteneure != null ? conteneure.getId_conteneure() : "null") +
                ", typeOperation=" + typeOperation +
                ", dateOperation=" + dateOperation +
                ", status=" + status +
                '}';
    }
} 