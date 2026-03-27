package com.smartutilities.backend.controllers;

import com.smartutilities.backend.models.UtilityBill;
import com.smartutilities.backend.services.UtilityBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.smartutilities.backend.adapters.BillReader;
import com.smartutilities.backend.repositories.UtilityServiceRepository;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*") // Para que tu frontend (luego) pueda conectarse sin problemas
public class UtilityBillController {

    @Autowired
    private UtilityBillService billService;

    @Autowired
    private BillReader billReader;

    @Autowired
    private UtilityServiceRepository utilityServiceRepository;

    // 1. Obtener todas las facturas para ver su estado actual
    @GetMapping
    public List<UtilityBill> getAllBills() {
        return billService.getAllBills();
    }

    // 2. Disparar el proceso de pago inteligente con IA
    // Se usa un POST porque vamos a "cambiar" el estado de un recurso
    @PostMapping("/pay/{id}")
    public ResponseEntity<String> processPayment(@PathVariable("id") Long id) { // <--- EL FIX DE SPRING BOOT 3.2
        String message = billService.processAutomaticPayment(id);

        if (message.contains("ERROR")) {
            return ResponseEntity.status(404).body(message);
        }

        return ResponseEntity.ok(message);
    }

    // 3. Recibir imagen OCR, extraer datos, y evaluar con IA
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadBillImage(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Extraer datos con el Adapter OCR (Mock que simula anomalía de consumo = 500)
            UtilityBill bill = billReader.extractDataFromImage(file);

            // 2. Asociar a un servicio (quemado ID 1 para el mock. Podría buscarse por un Cédula/Referencia de la imagen)
            com.smartutilities.backend.models.UtilityService service = utilityServiceRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("Servicio con ID 1 no encontrado en la base de datos"));
            bill.setUtilityService(service);

            // 3. Guardar en base de datos para obtener un ID manejable
            UtilityBill savedBill = billService.saveBill(bill);

            // 4. Evaluar automáticamente la factura recién creada
            String message = billService.processAutomaticPayment(savedBill.getId());

            if (message.contains("ERROR")) {
                return ResponseEntity.status(404).body(message);
            }
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("ERROR_PROCESS: No se pudo procesar la imagen: " + e.getMessage());
        }
    }
}
