package com.plozdev.smartfxapplication.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "SmartFX API", version = "1.0", description = "High-Performance Currency Exchange & Arbitrage Detection Engine"))
public class OpenApiConfig {

}
