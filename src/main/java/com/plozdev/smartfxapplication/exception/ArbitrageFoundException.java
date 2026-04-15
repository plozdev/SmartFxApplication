package com.plozdev.smartfxapplication.exception;

public class ArbitrageFoundException extends RuntimeException {
    public ArbitrageFoundException(String message) {
        super(message);
    }
    public ArbitrageFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
