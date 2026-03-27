package com.smartutilities.backend.controllers;

import com.smartutilities.backend.models.MonthlyBillSummary;
import com.smartutilities.backend.services.AiAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para el módulo de Análisis con IA.
 * Expone endpoints para obtener datos del gráfico de barras y los insights/recomendaciones.
 */
@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    @Autowired
    private AiAnalysisService aiAnalysisService;

    /**
     * GET /api/analysis/monthly
     * Retorna el resumen mensual de facturas agrupado por mes y tipo de servicio.
     * Alimenta el gráfico de barras del frontend.
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyBillSummary>> getMonthlyData() {
        try {
            List<MonthlyBillSummary> summaries = aiAnalysisService.getMonthlyBillSummaries();
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            System.err.println(">>> [AiAnalysis] Error obteniendo datos mensuales: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * GET /api/analysis/insights
     * Retorna el análisis de IA con tendencias detectadas y recomendaciones de ahorro.
     */
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        try {
            Map<String, Object> insights = aiAnalysisService.getAiInsights();
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            System.err.println(">>> [AiAnalysis] Error generando insights: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
