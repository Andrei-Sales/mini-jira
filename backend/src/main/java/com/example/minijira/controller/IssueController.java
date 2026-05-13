package com.example.minijira.controller;

import com.example.minijira.dto.CreateIssueDTO;
import com.example.minijira.dto.IssueDTO;
import com.example.minijira.dto.UpdateIssueDTO;
import com.example.minijira.dto.common.ApiMessageResponse;
import com.example.minijira.dto.common.PageResponse;
import com.example.minijira.dto.request.UpdateIssueStatusRequest;
import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssueType;
import com.example.minijira.service.IssueService;
import com.example.minijira.util.PageUtils;
import com.example.minijira.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public PageResponse<IssueDTO> getIssues(@RequestParam(required = false) Long projectId,
                                            @RequestParam(required = false) Long assigneeId,
                                            @RequestParam(required = false) IssueStatus status,
                                            @RequestParam(required = false) IssuePriority priority,
                                            @RequestParam(required = false) IssueType type,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<IssueDTO> issues = issueService.getIssues(
                projectId,
                assigneeId,
                status,
                priority,
                type,
                PageRequest.of(page, size, sort)
        );
        return PageUtils.from(issues);
    }

    @GetMapping("/{id}")
    public IssueDTO getIssue(@PathVariable Long id) {
        return issueService.getIssueById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','DEVELOPER','QA')")
    public IssueDTO createIssue(@Valid @RequestBody CreateIssueDTO request) {
        return issueService.createIssue(request, SecurityUtils.getCurrentUserId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','DEVELOPER','QA')")
    public IssueDTO updateIssue(@PathVariable Long id, @Valid @RequestBody UpdateIssueDTO request) {
        return issueService.updateIssue(id, request, SecurityUtils.getCurrentUserId());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','DEVELOPER','QA')")
    public IssueDTO updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateIssueStatusRequest request) {
        return issueService.updateIssueStatus(id, request.getStatus(), SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ApiMessageResponse deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id, SecurityUtils.getCurrentUserId());
        return ApiMessageResponse.builder().message("Issue deleted successfully").build();
    }
}