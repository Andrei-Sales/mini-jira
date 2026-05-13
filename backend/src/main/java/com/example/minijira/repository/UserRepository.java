package com.example.minijira.repository;

import com.example.minijira.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    Page<User> findByActive(Boolean active, Pageable pageable);
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
    @Query("select u from User u where u.active = true and u.id in (select m.id from Project p join p.members m where p.id = :projectId)")
    Page<User> findActiveProjectMembers(@Param("projectId") Long projectId, Pageable pageable);
}
