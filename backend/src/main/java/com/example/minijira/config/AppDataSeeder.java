package com.example.minijira.config;

import com.example.minijira.entity.Comment;
import com.example.minijira.entity.Issue;
import com.example.minijira.entity.Project;
import com.example.minijira.entity.User;
import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssueType;
import com.example.minijira.enums.ProjectStatus;
import com.example.minijira.enums.UserRole;
import com.example.minijira.repository.CommentRepository;
import com.example.minijira.repository.IssueRepository;
import com.example.minijira.repository.ProjectRepository;
import com.example.minijira.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AppDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public AppDataSeeder(UserRepository userRepository,
                         ProjectRepository projectRepository,
                         IssueRepository issueRepository,
                         CommentRepository commentRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = userRepository.save(User.builder()
                .email("admin@minijira.dev")
                .fullName("System Admin")
                .password(passwordEncoder.encode("Admin@123"))
                .role(UserRole.ADMIN)
                .active(true)
                .build());

        User pm = userRepository.save(User.builder()
                .email("pm@minijira.dev")
                .fullName("Project Manager")
                .password(passwordEncoder.encode("Pm@12345"))
                .role(UserRole.PROJECT_MANAGER)
                .active(true)
                .build());

        User dev = userRepository.save(User.builder()
                .email("dev@minijira.dev")
                .fullName("Developer One")
                .password(passwordEncoder.encode("Dev@12345"))
                .role(UserRole.DEVELOPER)
                .active(true)
                .build());

        User qa = userRepository.save(User.builder()
                .email("qa@minijira.dev")
                .fullName("QA Engineer")
                .password(passwordEncoder.encode("Qa@12345"))
                .role(UserRole.QA)
                .active(true)
                .build());

        Set<User> members = new HashSet<>();
        members.add(admin);
        members.add(pm);
        members.add(dev);
        members.add(qa);

        Project project = projectRepository.save(Project.builder()
                .projectKey("MINI")
                .name("MiniJira Platform")
                .description("Core product backlog and delivery project")
                .status(ProjectStatus.ACTIVE)
                .lead(pm)
                .members(members)
                .build());

        Issue issue1 = issueRepository.save(Issue.builder()
                .issueKey("MINI-1")
                .title("Build authentication API")
                .description("Implement register/login/logout with JWT")
                .type(IssueType.STORY)
                .status(IssueStatus.IN_PROGRESS)
                .priority(IssuePriority.HIGH)
                .project(project)
                .reporter(pm)
                .assignee(dev)
                .dueDate(LocalDateTime.now().plusDays(4))
                .build());

        Issue issue2 = issueRepository.save(Issue.builder()
                .issueKey("MINI-2")
                .title("Create Kanban board view")
                .description("Build draggable issue cards grouped by status")
                .type(IssueType.TASK)
                .status(IssueStatus.TODO)
                .priority(IssuePriority.MEDIUM)
                .project(project)
                .reporter(pm)
                .assignee(qa)
                .dueDate(LocalDateTime.now().plusDays(6))
                .build());

        commentRepository.save(Comment.builder()
                .issue(issue1)
                .author(pm)
                .content("Please share API contract before EOD.")
                .build());

        commentRepository.save(Comment.builder()
                .issue(issue1)
                .author(dev)
                .content("Working on token refresh and endpoint guards now.")
                .build());

        commentRepository.save(Comment.builder()
                .issue(issue2)
                .author(qa)
                .content("Will prepare board acceptance checklist after UI scaffold.")
                .build());
    }
}