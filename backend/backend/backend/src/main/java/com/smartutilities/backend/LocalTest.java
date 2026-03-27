package com.smartutilities.backend;

import com.smartutilities.backend.strategies.WekaAnomalyDetectionStrategy;
import com.smartutilities.backend.models.UtilityBill;

public class LocalTest {
    public static void main(String[] args) {
        System.out.println("Starting test...");
        WekaAnomalyDetectionStrategy w = new WekaAnomalyDetectionStrategy();
        UtilityBill bill = new UtilityBill();
        bill.setRegisteredConsumption(150.0);
        bill.setAmount(250000.0);
        bill.setReferenceNumber("12345");
        String result = w.analyze(bill);
        System.out.println("Result: " + result);
    }
}
