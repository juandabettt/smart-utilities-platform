package com.smartutilities.backend.services;

import com.smartutilities.backend.models.MonthlyBillSummary;
import com.smartutilities.backend.models.UtilityBill;
import com.smartutilities.backend.repositories.UtilityBillRepository;
import com.smartutilities.backend.strategies.AnalysisStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de Análisis con IA.
 * Agrupa las facturas por mes y tipo de servicio, detecta tendencias de aumento
 * y genera recomendaciones concretas basadas en la lógica Weka existente.
 */
@Service
public class AiAnalysisServiceImpl implements AiAnalysisService {

    @Autowired
    private UtilityBillRepository billRepository;

    @Autowired
    private AnalysisStrategy analysisStrategy;

    // Nombres de meses en español
    private static final String[] MONTH_NAMES = {
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    };

    @Override
    public List<MonthlyBillSummary> getMonthlyBillSummaries() {
        List<UtilityBill> allBills = billRepository.findAll();

        if (allBills.isEmpty()) {
            return generateDemoData();
        }

        // Agrupar por año-mes y tipo de servicio
        // Key: "YEAR-MONTH-SERVICETYPE"
        Map<String, List<UtilityBill>> grouped = allBills.stream()
            .filter(b -> b.getIssueDate() != null && b.getUtilityService() != null)
            .collect(Collectors.groupingBy(b -> {
                int year = b.getIssueDate().getYear();
                int month = b.getIssueDate().getMonthValue();
                // Obtener el tipo de servicio del discriminador
                String serviceType = getServiceType(b);
                return year + "-" + month + "-" + serviceType;
            }));

        List<MonthlyBillSummary> summaries = new ArrayList<>();

        for (Map.Entry<String, List<UtilityBill>> entry : grouped.entrySet()) {
            String[] parts = entry.getKey().split("-");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            String serviceType = parts[2];

            List<UtilityBill> bills = entry.getValue();
            double totalAmount = bills.stream().mapToDouble(UtilityBill::getAmount).sum();
            double totalConsumption = bills.stream().mapToDouble(UtilityBill::getRegisteredConsumption).sum();
            int billCount = bills.size();
            double avgAmount = totalAmount / billCount;

            summaries.add(new MonthlyBillSummary(
                year, month, MONTH_NAMES[month - 1], serviceType,
                totalAmount, billCount, avgAmount, totalConsumption
            ));
        }

        // Ordenar por año, mes y tipo de servicio
        summaries.sort(Comparator.comparingInt(MonthlyBillSummary::getYear)
            .thenComparingInt(MonthlyBillSummary::getMonth)
            .thenComparing(MonthlyBillSummary::getServiceType));

        return summaries;
    }

    @Override
    public Map<String, Object> getAiInsights() {
        List<UtilityBill> allBills = billRepository.findAll();
        Map<String, Object> insights = new LinkedHashMap<>();
        List<Map<String, Object>> recommendations = new ArrayList<>();
        List<Map<String, Object>> trends = new ArrayList<>();
        boolean hasRealData = !allBills.isEmpty();

        if (!hasRealData) {
            // Demo insights cuando no hay datos reales
            insights.put("status", "DEMO");
            insights.put("summary", "No hay suficientes datos reales. Se muestra un análisis de ejemplo con datos generados.");
            insights.put("overallTrend", "INCREASING");
            insights.put("anomalyCount", 2);
            insights.put("recommendations", buildDemoRecommendations());
            insights.put("trends", buildDemoTrends());
            return insights;
        }

        // Análisis real: verificar anomalías con Weka
        int anomalyCount = 0;
        for (UtilityBill bill : allBills) {
            String verdict = analysisStrategy.analyze(bill);
            if (!"NORMAL".equals(verdict)) {
                anomalyCount++;
            }
        }

        // Detectar tendencia general: comparar meses consecutivos
        String overallTrend = detectOverallTrend(allBills);

        // Agrupar por servicio para tendencias individuales
        Map<String, List<UtilityBill>> byService = allBills.stream()
            .filter(b -> b.getUtilityService() != null)
            .collect(Collectors.groupingBy(this::getServiceType));

        for (Map.Entry<String, List<UtilityBill>> entry : byService.entrySet()) {
            String serviceType = entry.getKey();
            List<UtilityBill> serviceBills = entry.getValue();
            String serviceTrend = detectTrendForBills(serviceBills);
            double lastAmount = serviceBills.stream()
                .max(Comparator.comparing(b -> b.getIssueDate()))
                .map(UtilityBill::getAmount).orElse(0.0);

            Map<String, Object> trend = new LinkedHashMap<>();
            trend.put("service", getServiceDisplayName(serviceType));
            trend.put("serviceType", serviceType);
            trend.put("trend", serviceTrend);
            trend.put("lastAmount", lastAmount);
            trend.put("billCount", serviceBills.size());
            trends.add(trend);

            // Generar recomendación por servicio
            recommendations.add(buildRecommendation(serviceType, serviceTrend, lastAmount, serviceBills.size()));
        }

        // Recomendación general si hay anomalías
        if (anomalyCount > 0) {
            Map<String, Object> anomalyRec = new LinkedHashMap<>();
            anomalyRec.put("type", "ALERT");
            anomalyRec.put("icon", "warning");
            anomalyRec.put("title", anomalyCount + " anomalía(s) detectada(s) por la IA");
            anomalyRec.put("description", "La IA de Weka identificó " + anomalyCount +
                " factura(s) con consumo fuera del rango normal. Revisa el historial de facturas bloqueadas.");
            anomalyRec.put("priority", "HIGH");
            recommendations.add(0, anomalyRec); // Al principio
        }

        insights.put("status", "OK");
        insights.put("totalBills", allBills.size());
        insights.put("anomalyCount", anomalyCount);
        insights.put("overallTrend", overallTrend);
        insights.put("summary", buildSummaryText(overallTrend, anomalyCount, allBills.size()));
        insights.put("trends", trends);
        insights.put("recommendations", recommendations);

        return insights;
    }

    // ===============================================
    // MÉTODOS AUXILIARES
    // ===============================================

    private String getServiceType(UtilityBill bill) {
        if (bill.getUtilityService() == null) return "UNKNOWN";
        String className = bill.getUtilityService().getClass().getSimpleName();
        switch (className) {
            case "WaterService": return "WATER";
            case "EnergyService": return "ENERGY";
            default: return "GAS";
        }
    }

    private String getServiceDisplayName(String serviceType) {
        switch (serviceType) {
            case "WATER": return "Agua";
            case "ENERGY": return "Luz/Energía";
            case "GAS": return "Gas";
            default: return serviceType;
        }
    }

    private String detectOverallTrend(List<UtilityBill> bills) {
        if (bills.size() < 2) return "STABLE";
        List<UtilityBill> sorted = bills.stream()
            .filter(b -> b.getIssueDate() != null)
            .sorted(Comparator.comparing(UtilityBill::getIssueDate))
            .collect(Collectors.toList());
        if (sorted.size() < 2) return "STABLE";
        // Comparar primera mitad vs segunda mitad
        int mid = sorted.size() / 2;
        double firstHalfAvg = sorted.subList(0, mid).stream().mapToDouble(UtilityBill::getAmount).average().orElse(0);
        double secondHalfAvg = sorted.subList(mid, sorted.size()).stream().mapToDouble(UtilityBill::getAmount).average().orElse(0);
        if (secondHalfAvg > firstHalfAvg * 1.05) return "INCREASING";
        if (secondHalfAvg < firstHalfAvg * 0.95) return "DECREASING";
        return "STABLE";
    }

    private String detectTrendForBills(List<UtilityBill> bills) {
        return detectOverallTrend(bills);
    }

    private String buildSummaryText(String trend, int anomalyCount, int totalBills) {
        StringBuilder sb = new StringBuilder();
        sb.append("Se analizaron ").append(totalBills).append(" factura(s) en el sistema. ");
        switch (trend) {
            case "INCREASING":
                sb.append("La IA detectó una tendencia de AUMENTO en los costos de servicios públicos. ");
                sb.append("Es recomendable revisar los hábitos de consumo y aplicar medidas de ahorro.");
                break;
            case "DECREASING":
                sb.append("La IA detectó una tendencia de DISMINUCIÓN en los costos. ¡Excelente gestión del consumo!");
                break;
            default:
                sb.append("Los costos se mantienen ESTABLES sin variaciones significativas.");
        }
        if (anomalyCount > 0) {
            sb.append(" Se detectaron ").append(anomalyCount).append(" anomalía(s) que requieren atención.");
        }
        return sb.toString();
    }

    private Map<String, Object> buildRecommendation(String serviceType, String trend, double lastAmount, int count) {
        Map<String, Object> rec = new LinkedHashMap<>();
        String priority = "INCREASING".equals(trend) ? "HIGH" : "LOW";
        rec.put("type", "INCREASING".equals(trend) ? "WARNING" : "INFO");
        rec.put("icon", "INCREASING".equals(trend) ? "trending-up" : "check-circle");
        rec.put("priority", priority);

        switch (serviceType) {
            case "WATER":
                rec.put("title", "Servicio de Agua — " + ("INCREASING".equals(trend) ? "Consumo en aumento" : "Consumo estable"));
                rec.put("description", "INCREASING".equals(trend)
                    ? "El consumo de agua ha aumentado. Revisa posibles fugas en tuberías, grifos y sanitarios. Instala reductores de caudal y optimiza el riego."
                    : "El consumo de agua se mantiene dentro de rangos normales. Continúa con los buenos hábitos de ahorro.");
                break;
            case "ENERGY":
                rec.put("title", "Servicio de Luz/Energía — " + ("INCREASING".equals(trend) ? "Consumo en aumento" : "Consumo estable"));
                rec.put("description", "INCREASING".equals(trend)
                    ? "El consumo eléctrico ha aumentado. Considera revisar electrodomésticos en uso continuo, cambiar a iluminación LED y desconectar dispositivos en standby."
                    : "El consumo eléctrico es eficiente. Mantén el uso responsable de electrodomésticos.");
                break;
            default:
                rec.put("title", "Servicio de Gas — " + ("INCREASING".equals(trend) ? "Consumo en aumento" : "Consumo estable"));
                rec.put("description", "INCREASING".equals(trend)
                    ? "El consumo de gas ha aumentado. Verifica el estado del medidor, busca posibles fugas y optimiza el uso de calefacción y cocina."
                    : "El consumo de gas es normal. Asegúrate de revisar el medidor periódicamente.");
        }
        return rec;
    }

    // ===============================================
    // DATOS DEMO (cuando no hay registros en DB)
    // ===============================================

    private List<MonthlyBillSummary> generateDemoData() {
        List<MonthlyBillSummary> demo = new ArrayList<>();
        int currentYear = java.time.LocalDate.now().getYear();
        double[] waterAmounts   = {45000, 47000, 48000, 46000, 50000, 52000, 54000, 53000, 55000, 57000, 58000, 60000};
        double[] energyAmounts  = {120000, 118000, 125000, 130000, 135000, 140000, 145000, 142000, 148000, 150000, 155000, 160000};
        double[] gasAmounts     = {30000, 32000, 28000, 25000, 20000, 18000, 17000, 18000, 22000, 28000, 35000, 38000};

        for (int m = 1; m <= 12; m++) {
            demo.add(new MonthlyBillSummary(currentYear, m, MONTH_NAMES[m-1], "WATER",
                waterAmounts[m-1], 1, waterAmounts[m-1], 8.5 + m * 0.3));
            demo.add(new MonthlyBillSummary(currentYear, m, MONTH_NAMES[m-1], "ENERGY",
                energyAmounts[m-1], 1, energyAmounts[m-1], 120 + m * 3.5));
            demo.add(new MonthlyBillSummary(currentYear, m, MONTH_NAMES[m-1], "GAS",
                gasAmounts[m-1], 1, gasAmounts[m-1], 15 + (m <= 6 ? -m : m - 6)));
        }
        return demo;
    }

    private List<Map<String, Object>> buildDemoRecommendations() {
        List<Map<String, Object>> recs = new ArrayList<>();
        Map<String, Object> r1 = new LinkedHashMap<>();
        r1.put("type", "WARNING"); r1.put("icon", "trending-up"); r1.put("priority", "HIGH");
        r1.put("title", "Servicio de Luz/Energía — Consumo en aumento");
        r1.put("description", "El consumo eléctrico ha aumentado un 33% en los últimos meses. Revisa electrodomésticos de alto consumo, migra a iluminación LED y desconecta dispositivos en standby.");
        recs.add(r1);
        Map<String, Object> r2 = new LinkedHashMap<>();
        r2.put("type", "WARNING"); r2.put("icon", "trending-up"); r2.put("priority", "HIGH");
        r2.put("title", "Servicio de Agua — Consumo en aumento");
        r2.put("description", "El consumo de agua ha aumentado gradualmente. Inspecciona gripería, cisternas e instalaciones en busca de fugas silenciosas. Instala aireadores en grifos.");
        recs.add(r2);
        Map<String, Object> r3 = new LinkedHashMap<>();
        r3.put("type", "INFO"); r3.put("icon", "check-circle"); r3.put("priority", "LOW");
        r3.put("title", "Servicio de Gas — Consumo estacional normal");
        r3.put("description", "El consumo de gas sigue un patrón estacional esperado: mayor en invierno y menor en verano. No se detectan anomalías.");
        recs.add(r3);
        return recs;
    }

    private List<Map<String, Object>> buildDemoTrends() {
        List<Map<String, Object>> trends = new ArrayList<>();
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("service", "Agua"); t1.put("serviceType", "WATER"); t1.put("trend", "INCREASING");
        t1.put("lastAmount", 60000.0); t1.put("billCount", 12);
        trends.add(t1);
        Map<String, Object> t2 = new LinkedHashMap<>();
        t2.put("service", "Luz/Energía"); t2.put("serviceType", "ENERGY"); t2.put("trend", "INCREASING");
        t2.put("lastAmount", 160000.0); t2.put("billCount", 12);
        trends.add(t2);
        Map<String, Object> t3 = new LinkedHashMap<>();
        t3.put("service", "Gas"); t3.put("serviceType", "GAS"); t3.put("trend", "STABLE");
        t3.put("lastAmount", 38000.0); t3.put("billCount", 12);
        trends.add(t3);
        return trends;
    }
}
