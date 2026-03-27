package com.smartutilities.backend.repositories;

import com.smartutilities.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring crea el SQL "SELECT * FROM users WHERE email = ?"
    Optional<User> findByEmail(String email);
}