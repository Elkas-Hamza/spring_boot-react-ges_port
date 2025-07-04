package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Shift;
import com.hamzaelkasmi.stage.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @GetMapping
    public ResponseEntity<List<Shift>> getAllShifts() {
        List<Shift> shifts = shiftService.getAllShifts();
        return new ResponseEntity<>(shifts, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shift> getShiftById(@PathVariable("id") String id) {
        Optional<Shift> shiftData = shiftService.getShiftById(id);
        if (shiftData.isPresent()) {
            return new ResponseEntity<>(shiftData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }    @PostMapping
    public ResponseEntity<Object> createShift(@RequestBody Shift shift) {
        try {
            System.out.println("Received shift data: " + shift);
            System.out.println("Received time values - debut: " + shift.getHeure_debut() + ", fin: " + shift.getHeure_fin());
            
            if (shift.getHeure_debut() == null || shift.getHeure_fin() == null) {
                System.err.println("Warning: Null time values detected!");
                return new ResponseEntity<>(
                    Map.of("error", "Invalid time format", "message", "Time values cannot be null"),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            Shift _shift = shiftService.saveShift(shift);
            return new ResponseEntity<>(_shift, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating shift: " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getName());
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to create shift", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shift> updateShift(@PathVariable("id") String id, @RequestBody Shift shift) {
        Optional<Shift> shiftData = shiftService.getShiftById(id);
        if (shiftData.isPresent()) {
            Shift _shift = shiftData.get();
            _shift.setNom_shift(shift.getNom_shift());
            _shift.setHeure_debut(shift.getHeure_debut());
            _shift.setHeure_fin(shift.getHeure_fin());
            return new ResponseEntity<>(shiftService.saveShift(_shift), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteShift(@PathVariable("id") String id) {
        try {
            shiftService.deleteShift(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 