package com.plozdev.smartfxapplication.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception để ném ra khi xuất hiện chu trình lặp vô tận lúc chạy ngược path
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InfiniteCycleException extends RuntimeException {
    public InfiniteCycleException(String message) {
        super(message);
    }
    public InfiniteCycleException(String message, Throwable cause) {
        super(message, cause);
    }
}
