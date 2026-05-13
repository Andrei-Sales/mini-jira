package com.example.minijira.service.impl;

import com.example.minijira.dto.CommentDTO;
import com.example.minijira.entity.Comment;
import com.example.minijira.entity.Issue;
import com.example.minijira.entity.User;
import com.example.minijira.enums.UserRole;
import com.example.minijira.exception.ForbiddenException;
import com.example.minijira.exception.ResourceNotFoundException;
import com.example.minijira.mapper.CommentMapper;
import com.example.minijira.repository.CommentRepository;
import com.example.minijira.repository.IssueRepository;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.service.ActivityLogService;
import com.example.minijira.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    private final ActivityLogService activityLogService;

    public CommentServiceImpl(CommentRepository commentRepository,
                              IssueRepository issueRepository,
                              UserRepository userRepository,
                              CommentMapper commentMapper,
                              ActivityLogService activityLogService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.commentMapper = commentMapper;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDTO> getCommentsByIssue(Long issueId, Pageable pageable) {
        ensureIssueExists(issueId);
        return commentRepository.findByIssueIdOrderByCreatedAtDesc(issueId, pageable).map(commentMapper::toDTO);
    }

    @Override
    @Transactional
    public CommentDTO addComment(Long issueId, String content, Long authorId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + authorId));

        Comment comment = Comment.builder()
                .issue(issue)
                .author(author)
                .content(content.trim())
                .build();

        Comment saved = commentRepository.save(comment);
        activityLogService.log(authorId, "COMMENT", "ISSUE", issueId, "Comment added");
        return commentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteComment(Long issueId, Long commentId, Long actorUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getIssue().getId().equals(issueId)) {
            throw new ResourceNotFoundException("Comment does not belong to this issue");
        }

        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + actorUserId));

        boolean canDelete = comment.getAuthor().getId().equals(actorUserId) || actor.getRole() == UserRole.ADMIN;
        if (!canDelete) {
            throw new ForbiddenException("You can delete only your own comments");
        }

        commentRepository.delete(comment);
        activityLogService.log(actorUserId, "DELETE_COMMENT", "COMMENT", commentId, "Comment deleted");
    }

    private void ensureIssueExists(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException("Issue not found with id: " + issueId);
        }
    }
}