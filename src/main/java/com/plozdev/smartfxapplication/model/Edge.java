package com.plozdev.smartfxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Edge {
    int to;
    double weight;
}
