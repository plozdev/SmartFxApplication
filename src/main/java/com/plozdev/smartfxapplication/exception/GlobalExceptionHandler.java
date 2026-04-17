package com.plozdev.smartfxapplication.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NoPathFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoPathFoundException(NoPathFoundException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.NOT_FOUND.value())
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }

    @ExceptionHandler(ArbitrageFoundException.class)
    public ResponseEntity<ErrorResponse> handleArbitrageFoundException(ArbitrageFoundException ex, WebRequest request) {
        var builder = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""));

        // Add cycle path if available
        if (ex.getCyclePath() != null && !ex.getCyclePath().isEmpty()) {
            var details = new HashMap<String, String>();
            details.put("arbitrageCycle", String.join(" -> ", ex.getCyclePath()));
            builder.details(details);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(builder.build());
    }

    @ExceptionHandler(InvalidCurrencyException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCurrencyException(InvalidCurrencyException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }

    @ExceptionHandler(InfiniteCycleException.class)
    public ResponseEntity<ErrorResponse> handleInfiniteCycleException(InfiniteCycleException ex, WebRequest request) {
        // 422 Unprocessable Entity (StandardHttpStatus, not deprecated)
        return ResponseEntity.status(HttpStatus.valueOf(422))
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(422)
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, WebRequest request) {
        // Log full exception server-side for debugging
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }
}

