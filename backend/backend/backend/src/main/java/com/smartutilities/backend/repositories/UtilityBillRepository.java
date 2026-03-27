package com.smartutilities.backend.repositories;

import com.smartutilities.backend.models.UtilityBill;
import com.smartutilities.backend.models.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UtilityBillRepository extends JpaRepository<UtilityBill, Long> {

    // Buscará todas las facturas en estado "PENDING" para mandárselas a Weka a
    // analizar.
    List<UtilityBill> findByStatus(BillStatus status);
}