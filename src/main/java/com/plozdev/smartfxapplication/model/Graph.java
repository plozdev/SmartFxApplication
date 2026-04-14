package com.plozdev.smartfxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Graph {
    private Map<String, Integer> id = new HashMap<>();
    private List<String> reverse = new ArrayList<>();
    private List<List<Edge>> adj = new ArrayList<>();

    public int getOrAssignId(String currency) {
        return id.computeIfAbsent(currency, k -> {
            int newId = adj.size();
            adj.add(new ArrayList<>());
            reverse.add(currency);
            return newId;
        });
    }

    public void addEdge(String from, String to, double weight) {
        int u = getOrAssignId(from);
        int v = getOrAssignId(to);
        adj.get(u).add(new Edge(v, weight));
    }

    public List<Edge> getNeighbors(int u) {
        return adj.get(u);
    }

    public int size() {
        return adj.size();
    }

    public int getId(String currency) {
        return id.get(currency);
    }

    public String getName(int id) {
        return reverse.get(id);
    }
}
