package com.example.minijira.repository;

import com.example.minijira.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    @EntityGraph(attributePaths = {"user"})
    Page<ActivityLog> findAll(Pageable pageable);
    @EntityGraph(attributePaths = {"user"})
    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();
}
