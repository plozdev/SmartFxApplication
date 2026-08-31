package com.plozdev.smartfxapplication.service;

import com.plozdev.smartfxapplication.dto.ExchangeResponse;
import com.plozdev.smartfxapplication.model.Graph;
import com.plozdev.smartfxapplication.model.SPFAResult;

import java.util.List;

public interface AlgorithmServiceI {
    SPFAResult findBestPath(Graph graph, int source);
    List<Integer> getPath(int target, int[] parent);
    List<Integer> findArbitrage(int []parent, int n, int cycleNode);
    List<String> toCurrencyPath(Graph g, List<Integer> path);
    ExchangeResponse findOptimalExchange(String from, String to, double amount);
}
