package com.example.minijira.mapper;

import com.example.minijira.dto.CommentDTO;
import com.example.minijira.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {
    private final UserMapper userMapper;

    public CommentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public CommentDTO toDTO(Comment comment) {
        if (comment == null) {
            return null;
        }
        return CommentDTO.builder()
                .id(comment.getId())
                .issueId(comment.getIssue().getId())
                .author(userMapper.toDTO(comment.getAuthor()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
