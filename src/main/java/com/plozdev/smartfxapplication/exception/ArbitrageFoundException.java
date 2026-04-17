package com.plozdev.smartfxapplication.exception;

import java.util.List;

public class ArbitrageFoundException extends RuntimeException {
    private final List<String> cyclePath;

    public ArbitrageFoundException(String message) {
        super(message);
        this.cyclePath = null;
    }

    public ArbitrageFoundException(String message, List<String> cyclePath) {
        super(message);
        this.cyclePath = cyclePath;
    }

    public ArbitrageFoundException(String message, Throwable cause) {
        super(message, cause);
        this.cyclePath = null;
    }

    public List<String> getCyclePath() {
        return cyclePath;
    }
}
