package com.hamzaelkasmi.stage.config;

import com.hamzaelkasmi.stage.generateure.UserIdGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class IdGeneratorConfig {

    @Bean
    public UserIdGenerator userIdGenerator(DataSource dataSource) {
        UserIdGenerator generator = new UserIdGenerator();
        generator.setDataSource(dataSource);
        return generator;
    }
}
