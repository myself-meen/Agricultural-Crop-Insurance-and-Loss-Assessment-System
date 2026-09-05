package com.examly.springapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAadhaarException extends RuntimeException {
    public InvalidAadhaarException(String message) {
        super(message);
    }
}
