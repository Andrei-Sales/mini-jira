package com.example.minijira.repository;

import com.example.minijira.entity.Issue;
import com.example.minijira.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {
    Optional<Issue> findByIssueKey(String issueKey);
    boolean existsByIssueKeyIgnoreCase(String issueKey);
    @EntityGraph(attributePaths = {"project", "reporter", "assignee"})
    Page<Issue> findByProjectId(Long projectId, Pageable pageable);
    @EntityGraph(attributePaths = {"project", "reporter", "assignee"})
    Page<Issue> findByAssigneeId(Long assigneeId, Pageable pageable);
    @EntityGraph(attributePaths = {"project", "reporter", "assignee"})
    Page<Issue> findByStatus(IssueStatus status, Pageable pageable);
    @EntityGraph(attributePaths = {"project", "reporter", "assignee"})
    Optional<Issue> findById(Long id);
    @EntityGraph(attributePaths = {"project", "reporter", "assignee"})
    Page<Issue> findAll(Pageable pageable);
    long countByProjectId(Long projectId);
    long countByStatus(IssueStatus status);
    long countByAssigneeId(Long assigneeId);
}
