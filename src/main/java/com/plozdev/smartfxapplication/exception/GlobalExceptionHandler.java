package com.plozdev.smartfxapplication.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Helper method to build consistent error response format
     */
    private Map<String, Object> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", message);
        body.put("status", status.value());
        return body;
    }

    @ExceptionHandler(NoPathFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoPathFoundException(NoPathFoundException ex) {
        return new ResponseEntity<>(
                buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ArbitrageFoundException.class)
    public ResponseEntity<Map<String, Object>> handleArbitrageFoundException(ArbitrageFoundException ex) {
        return new ResponseEntity<>(
                buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(InvalidCurrencyException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCurrencyException(InvalidCurrencyException ex) {
        return new ResponseEntity<>(
                buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(InfiniteCycleException.class)
    public ResponseEntity<Map<String, Object>> handleInfiniteCycleException(InfiniteCycleException ex) {
        // 422 Unprocessable Entity (StandardHttpStatus, not deprecated)
        return new ResponseEntity<>(
                buildErrorResponse(ex.getMessage(), HttpStatus.valueOf(422)),
                HttpStatus.valueOf(422)
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        // Log full exception server-side for debugging
        log.error("Unhandled exception", ex);
        return new ResponseEntity<>(
                buildErrorResponse("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}

