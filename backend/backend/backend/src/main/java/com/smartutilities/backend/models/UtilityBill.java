package com.smartutilities.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore; // Importante

@Entity
@Table(name = "utility_bills")
public class UtilityBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status;

    @Column(name = "registered_consumption", nullable = false)
    private Double registeredConsumption;

    // ==========================================
    // EL "MARTILLO" PARA EL ERROR 500
    // ==========================================
    @JsonIgnore // Esto evita que el JSON entre en un bucle infinito
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private UtilityService utilityService;

    public UtilityBill() {
    }

    public void markAsPaid() {
        this.status = BillStatus.PAID;
    }

    // GETTERS Y SETTERS
    public Long getId() {
        return id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String rn) {
        this.referenceNumber = rn;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double a) {
        this.amount = a;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate d) {
        this.issueDate = d;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate d) {
        this.dueDate = d;
    }

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus s) {
        this.status = s;
    }

    public Double getRegisteredConsumption() {
        return registeredConsumption;
    }

    public void setRegisteredConsumption(Double c) {
        this.registeredConsumption = c;
    }

    public UtilityService getUtilityService() {
        return utilityService;
    }

    public void setUtilityService(UtilityService s) {
        this.utilityService = s;
    }
}