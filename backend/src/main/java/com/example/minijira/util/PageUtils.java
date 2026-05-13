package com.example.minijira.util;

import com.example.minijira.dto.common.PageResponse;
import org.springframework.data.domain.Page;

public final class PageUtils {
    private PageUtils() {
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}