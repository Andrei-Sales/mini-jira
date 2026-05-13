package com.example.minijira.repository;

import com.example.minijira.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectKey(String projectKey);
    boolean existsByProjectKeyIgnoreCase(String projectKey);
    @EntityGraph(attributePaths = {"lead", "members"})
    Optional<Project> findById(Long id);
    @EntityGraph(attributePaths = {"lead"})
    Page<Project> findAll(Pageable pageable);
}
