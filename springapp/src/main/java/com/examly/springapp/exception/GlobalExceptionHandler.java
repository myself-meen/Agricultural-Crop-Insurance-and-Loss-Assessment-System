package com.examly.springapp.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({InvalidNameException.class, InvalidPhoneException.class, InvalidAadhaarException.class})
    public ResponseEntity<ErrorDetails> handleBadRequestExceptions(RuntimeException ex, WebRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateClaimException.class)
    public ResponseEntity<ErrorDetails> handleDuplicateClaimException(DuplicateClaimException ex, WebRequest request) {
        log.warn("Duplicate claim error: {}", ex.getMessage());
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorisedAccessException.class)
    public ResponseEntity<ErrorDetails> handleUnauthorisedAccessException(UnauthorisedAccessException ex, WebRequest request) {
        log.warn("Unauthorised access attempt: {}", ex.getMessage());
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((first, second) -> first + ", " + second)
                .orElse("Validation failed");

        log.warn("Validation failed: {}", errorMessage);
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                errorMessage,
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex, WebRequest request) {
        log.error("Internal error occurred: ", ex);
        ErrorDetails details = new ErrorDetails(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(details, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
