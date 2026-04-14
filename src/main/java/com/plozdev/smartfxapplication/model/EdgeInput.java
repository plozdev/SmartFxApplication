package com.plozdev.smartfxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EdgeInput {
    private String from;
    private String to;
    private double rate;
    private double fee;

    public double getWeight() {
        return -Math.log(rate * (1 - fee));
    }

}
