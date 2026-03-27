package com.smartutilities.backend.repositories;

import com.smartutilities.backend.models.UtilityService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UtilityServiceRepository extends JpaRepository<UtilityService, Long> {

    // Para buscar rápidamente a quién pertenece un medidor o contrato
    UtilityService findByContractNumber(String contractNumber);
}