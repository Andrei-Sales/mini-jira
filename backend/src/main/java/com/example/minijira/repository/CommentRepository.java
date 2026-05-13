package com.example.minijira.repository;

import com.example.minijira.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @EntityGraph(attributePaths = {"author"})
    Page<Comment> findByIssueId(Long issueId, Pageable pageable);
    @EntityGraph(attributePaths = {"author"})
    Page<Comment> findByIssueIdOrderByCreatedAtDesc(Long issueId, Pageable pageable);
}
