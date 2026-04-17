package com.plozdev.smartfxapplication.service;

import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.model.Graph;

import java.util.List;

public interface GraphManagementI {
    void updateGraph(List<EdgeInput> newEdges);
    void addEdge(EdgeInput edgeInput);
    Graph getGraphSnapshot();
}
