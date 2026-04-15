package com.plozdev.smartfxapplication.exception;

public class InfiniteCycleException extends RuntimeException {
    public InfiniteCycleException(String message) {
        super(message);
    }
    public InfiniteCycleException(String message, Throwable cause) {
        super(message, cause);
    }
}
