package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Shift;
import com.hamzaelkasmi.stage.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public Optional<Shift> getShiftById(String id) {
        return shiftRepository.findById(id);
    }

    public Shift saveShift(Shift shift) {
        return shiftRepository.save(shift);
    }

    public void deleteShift(String id) {
        shiftRepository.deleteById(id);
    }
} 