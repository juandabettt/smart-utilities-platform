package com.smartutilities.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ENERGY") // Esta es la palabra que se guardará en la columna service_type
public class EnergyService extends UtilityService {

    @Column(name = "voltage_level")
    private Integer voltageLevel;

    public EnergyService() {
    }

    // Cumpliendo con el contrato del método abstracto de la clase padre
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.smartutilities.backend.models.UtilityService#calculateAverageConsumption(
     * )
     */
    @Override
    public Double calculateAverageConsumption() {
        // Por ahora retornamos 0.0, la lógica la conectaremos con Weka más adelante
        return 0.0;
    }

    // Getters y Setters
    public Integer getVoltageLevel() {
        return voltageLevel;
    }

    public void setVoltageLevel(Integer voltageLevel) {
        this.voltageLevel = voltageLevel;
    }
}