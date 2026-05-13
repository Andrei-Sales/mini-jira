package com.example.minijira.service;

import com.example.minijira.dto.CommentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Page<CommentDTO> getCommentsByIssue(Long issueId, Pageable pageable);
    CommentDTO addComment(Long issueId, String content, Long authorId);
    void deleteComment(Long issueId, Long commentId, Long actorUserId);
}