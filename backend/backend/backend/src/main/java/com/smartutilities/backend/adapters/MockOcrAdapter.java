package com.smartutilities.backend.adapters;

import com.smartutilities.backend.models.BillStatus;
import com.smartutilities.backend.models.UtilityBill;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Component
public class MockOcrAdapter implements BillReader {

    @Override
    public UtilityBill extractDataFromImage(MultipartFile file) {
        String filename = file != null ? file.getOriginalFilename() : "N/A";
        System.out.println("MockOcrAdapter: Procesando imagen " + filename);

        UtilityBill bill = new UtilityBill();
        bill.setReferenceNumber("REF-OCR-" + System.currentTimeMillis());

        // Lógica dinámica para la demostración
        if (filename != null && filename.toLowerCase().contains("fuga")) {
            // Escenario 1: Anomalía (Bloqueo por Weka)
            bill.setRegisteredConsumption(500.0);
            bill.setAmount(150000.0);
        } else {
            // Escenario 2: Factura Normal (Éxito)
            bill.setRegisteredConsumption(15.0);
            bill.setAmount(45000.0);
        }

        bill.setStatus(BillStatus.PENDING);
        bill.setIssueDate(LocalDate.now());
        bill.setDueDate(LocalDate.now().plusDays(30));

        return bill;
    }
}
