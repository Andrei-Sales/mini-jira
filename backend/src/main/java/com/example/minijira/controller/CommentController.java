package com.example.minijira.controller;

import com.example.minijira.dto.CommentDTO;
import com.example.minijira.dto.CreateCommentDTO;
import com.example.minijira.dto.common.ApiMessageResponse;
import com.example.minijira.dto.common.PageResponse;
import com.example.minijira.service.CommentService;
import com.example.minijira.util.PageUtils;
import com.example.minijira.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues/{issueId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public PageResponse<CommentDTO> getComments(@PathVariable Long issueId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        Page<CommentDTO> comments = commentService.getCommentsByIssue(
                issueId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return PageUtils.from(comments);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public CommentDTO addComment(@PathVariable Long issueId, @Valid @RequestBody CreateCommentDTO request) {
        return commentService.addComment(issueId, request.getContent(), SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiMessageResponse deleteComment(@PathVariable Long issueId, @PathVariable Long commentId) {
        commentService.deleteComment(issueId, commentId, SecurityUtils.getCurrentUserId());
        return ApiMessageResponse.builder().message("Comment deleted successfully").build();
    }
}