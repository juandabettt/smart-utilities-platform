package com.smartutilities.backend.models;

/**
 * DTO que representa el resumen mensual de facturas por tipo de servicio.
 * Usado para alimentar el gráfico de barras en la vista de Análisis con IA.
 */
public class MonthlyBillSummary {

    private int year;
    private int month;          // 1-12
    private String monthName;   // Enero, Febrero...
    private String serviceType; // WATER, ENERGY, GAS
    private double totalAmount;
    private int billCount;
    private double avgAmount;
    private double totalConsumption;

    public MonthlyBillSummary() {}

    public MonthlyBillSummary(int year, int month, String monthName, String serviceType,
                               double totalAmount, int billCount, double avgAmount, double totalConsumption) {
        this.year = year;
        this.month = month;
        this.monthName = monthName;
        this.serviceType = serviceType;
        this.totalAmount = totalAmount;
        this.billCount = billCount;
        this.avgAmount = avgAmount;
        this.totalConsumption = totalConsumption;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public String getMonthName() { return monthName; }
    public void setMonthName(String monthName) { this.monthName = monthName; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public int getBillCount() { return billCount; }
    public void setBillCount(int billCount) { this.billCount = billCount; }

    public double getAvgAmount() { return avgAmount; }
    public void setAvgAmount(double avgAmount) { this.avgAmount = avgAmount; }

    public double getTotalConsumption() { return totalConsumption; }
    public void setTotalConsumption(double totalConsumption) { this.totalConsumption = totalConsumption; }
}
