package com.plozdev.smartfxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class EdgeInput {
    private String from;
    private String to;
    private double rate;
    private double fee;
    private double weight;

    public EdgeInput(String from, String to, double rate, double fee) {
        this.from = from;
        this.to = to;
        this.rate = rate;
        this.fee = fee;
        this.weight = -Math.log(rate * (1 - fee));
    }

}
