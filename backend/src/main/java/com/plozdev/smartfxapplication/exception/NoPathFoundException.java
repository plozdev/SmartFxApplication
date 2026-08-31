package com.plozdev.smartfxapplication.exception;

public class NoPathFoundException extends RuntimeException {
    public NoPathFoundException(String message) {
        super(message);
    }
    public NoPathFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
