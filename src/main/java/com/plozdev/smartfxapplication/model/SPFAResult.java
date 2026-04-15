package com.plozdev.smartfxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SPFAResult {
    double[] dist;
    int[] parent;
    boolean hasNegativeCycle;
}
