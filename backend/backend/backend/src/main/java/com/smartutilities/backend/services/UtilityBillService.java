package com.smartutilities.backend.services;

import com.smartutilities.backend.models.UtilityBill;
import java.util.List;

public interface UtilityBillService {
    String processAutomaticPayment(Long billId);

    UtilityBill saveBill(UtilityBill bill);

    List<UtilityBill> getAllBills();
}
