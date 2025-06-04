package com.hamzaelkasmi.stage.config;

import com.hamzaelkasmi.stage.generateure.PersonnelIdGenerator;
import com.hamzaelkasmi.stage.generateure.SoustraiteureIdGenerator;
import com.hamzaelkasmi.stage.generateure.UserIdGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class IdGeneratorConfig {

    @Bean
    public UserIdGenerator userIdGenerator(DataSource dataSource) {
        UserIdGenerator generator = new UserIdGenerator();
        generator.setDataSource(dataSource);
        return generator;
    }
    
    @Bean
    public PersonnelIdGenerator personnelIdGenerator(DataSource dataSource) {
        PersonnelIdGenerator generator = new PersonnelIdGenerator();
        generator.setDataSource(dataSource);
        return generator;
    }
    
    @Bean
    public SoustraiteureIdGenerator soustraiteureIdGenerator(DataSource dataSource) {
        SoustraiteureIdGenerator generator = new SoustraiteureIdGenerator();
        generator.setDataSource(dataSource);
        return generator;
    }
}
