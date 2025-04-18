package com.wandernest.WanderNest.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;
    private List<RoomTypeAvailabilityDTO> availabilityList;
    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode;

    private com.wandernest.WanderNest.dto.UserDTO user;
    private com.wandernest.WanderNest.dto.RoomDTO room;
    private com.wandernest.WanderNest.dto.BookingDTO booking;
    private List<com.wandernest.WanderNest.dto.UserDTO> userList;
    private List<com.wandernest.WanderNest.dto.RoomDTO> roomList;
    private List<com.wandernest.WanderNest.dto.BookingDTO> bookingList;


}
