package com.smartutilities.backend.services;

import com.smartutilities.backend.models.UtilityBill;
import com.smartutilities.backend.models.BillStatus; // Importante importar el Enum
import com.smartutilities.backend.repositories.UtilityBillRepository;
import com.smartutilities.backend.strategies.AnalysisStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilityBillServiceImpl implements UtilityBillService {

    @Autowired
    private UtilityBillRepository repository;

    @Autowired
    private AnalysisStrategy analysisStrategy;

    @Override
    public String processAutomaticPayment(Long billId) {
        Optional<UtilityBill> optionalBill = repository.findById(billId);

        if (optionalBill.isPresent()) {
            UtilityBill bill = optionalBill.get();

            // 1. La IA analiza la factura
            String verdict = analysisStrategy.analyze(bill);

            // 2. Lógica usando el Enum BillStatus
            if ("NORMAL".equals(verdict)) {
                bill.setStatus(BillStatus.PAID); // <--- Cambio clave: Usamos el Enum
                repository.save(bill);
                return "SUCCESS: Factura pagada automáticamente. La IA confirmó consumo normal.";
            } else {
                bill.setStatus(BillStatus.BLOCKED_BY_AI); // <--- Cambio clave
                repository.save(bill);
                return "WARNING: Pago bloqueado. La IA detectó una anomalía (Fuga o Fraude).";
            }
        }
        return "ERROR: Factura no encontrada.";
    }

    @Override
    public List<UtilityBill> getAllBills() {
        return repository.findAll();
    }

    @Override
    public UtilityBill saveBill(UtilityBill bill) {
        return repository.save(bill);
    }
}