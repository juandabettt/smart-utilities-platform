package com.smartutilities.backend.models;

import jakarta.persistence.*;
import java.util.List; // Importación de la lista activada

@Entity
@Table(name = "users") // Nombramos la tabla en minúsculas y plural
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID autoincrementable
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150) // unique=true evita correos duplicados
    private String email;

    @Column(name = "password_hash", nullable = false) // Mapeamos camelCase a snake_case para la DB
    private String passwordHash;

    // ==============================================================
    // RELACIÓN ACTIVADA: 1 Usuario tiene Muchos Servicios
    // ==============================================================
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UtilityService> utilityServices;

    // Constructor vacío exigido por JPA (Hibernate)
    public User() {
    }

    // ==========================================
    // GETTERS Y SETTERS (Encapsulamiento)
    // ==========================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    // ==============================================================
    // GETTERS Y SETTERS DE LA RELACIÓN
    // ==============================================================
    public List<UtilityService> getUtilityServices() {
        return utilityServices;
    }

    public void setUtilityServices(List<UtilityService> utilityServices) {
        this.utilityServices = utilityServices;
    }
}