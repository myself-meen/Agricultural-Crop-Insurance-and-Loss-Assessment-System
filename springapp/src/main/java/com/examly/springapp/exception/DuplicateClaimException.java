package com.examly.springapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateClaimException extends RuntimeException {
    public DuplicateClaimException(String message) {
        super(message);
    }
}
