package com.smartutilities.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "utility_services") // Nombre de la tabla en la base de datos
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Estrategia de herencia
@DiscriminatorColumn(name = "service_type", discriminatorType = DiscriminatorType.STRING) // La columna que dirá si es
                                                                                          // WATER o ENERGY
public abstract class UtilityService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_number", nullable = false, unique = true)
    private String contractNumber;

    @Column(name = "provider_company", nullable = false)
    private String providerCompany;

    // ==========================================
    // RELACIÓN MUCHOS A UNO CON USER
    // ==========================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // Esta es la Foreign Key en la base de datos
    private User user;

    public UtilityService() {
    }

    // ==========================================
    // MÉTODO ABSTRACTO (Patrón de Diseño)
    // ==========================================
    public abstract Double calculateAverageConsumption();

    // ==========================================
    // GETTERS Y SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public void setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
    }

    public String getProviderCompany() {
        return providerCompany;
    }

    public void setProviderCompany(String providerCompany) {
        this.providerCompany = providerCompany;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}