package com.plozdev.smartfxapplication.service;

import com.plozdev.smartfxapplication.dto.InjectedResponse;
import com.plozdev.smartfxapplication.dto.ResetResponse;

public interface DemoServiceI {
    ResetResponse reset();
    InjectedResponse injectArbitrage(String from, String to, double rate);
}
