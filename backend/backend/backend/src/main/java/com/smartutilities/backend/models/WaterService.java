package com.smartutilities.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("WATER") // Esta es la palabra que se guardará en la columna service_type
public class WaterService extends UtilityService {

    @Column(name = "meter_diameter")
    private Double meterDiameter;

    public WaterService() {
    }

    // Cumpliendo con el contrato del método abstracto de la clase padre
    @Override
    public Double calculateAverageConsumption() {
        // Por ahora retornamos 0.0, la lógica de cálculo la haremos después
        return 0.0;
    }

    // Getters y Setters
    public Double getMeterDiameter() {
        return meterDiameter;
    }

    public void setMeterDiameter(Double meterDiameter) {
        this.meterDiameter = meterDiameter;
    }
}