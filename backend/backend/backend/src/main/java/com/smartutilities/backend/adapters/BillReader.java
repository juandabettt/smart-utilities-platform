package com.smartutilities.backend.adapters;

import com.smartutilities.backend.models.UtilityBill;
import org.springframework.web.multipart.MultipartFile;

public interface BillReader {
    UtilityBill extractDataFromImage(MultipartFile file);
}
