package com.wandernest.WanderNest.dto;

import lombok.Data;

import java.math.BigDecimal;

// RoomTypeAvailabilityDTO.java
@Data
public class RoomTypeAvailabilityDTO {
    private String roomType;
    private int availableCount;
    private BigDecimal pricePerNight;

    public RoomTypeAvailabilityDTO(String roomType, long availableCount, BigDecimal pricePerNight) {
        this.roomType = roomType;
        this.availableCount = (int) availableCount;
        this.pricePerNight = pricePerNight;
    }
}
