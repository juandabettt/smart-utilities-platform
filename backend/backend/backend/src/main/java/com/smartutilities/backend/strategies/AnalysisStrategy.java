package com.smartutilities.backend.strategies;

import com.smartutilities.backend.models.UtilityBill;

public interface AnalysisStrategy {
    // Este método recibirá una factura y nos dirá si es "NORMAL" o "ANOMALOUS"
    String analyze(UtilityBill bill);
}
