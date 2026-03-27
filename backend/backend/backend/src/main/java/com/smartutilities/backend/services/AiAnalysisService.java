package com.smartutilities.backend.services;

import com.smartutilities.backend.models.MonthlyBillSummary;
import java.util.List;
import java.util.Map;

/**
 * Contrato del servicio de análisis con IA para tendencias mensuales.
 */
public interface AiAnalysisService {

    /** Retorna el resumen mensual de facturas agrupado por mes y tipo de servicio. */
    List<MonthlyBillSummary> getMonthlyBillSummaries();

    /** Retorna insights/recomendaciones de la IA basados en las tendencias detectadas. */
    Map<String, Object> getAiInsights();
}
