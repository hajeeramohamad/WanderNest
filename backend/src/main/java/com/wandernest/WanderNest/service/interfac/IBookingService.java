package com.wandernest.WanderNest.service.interfac;

import com.wandernest.WanderNest.dto.Response;
import com.wandernest.WanderNest.entity.Booking;

public interface IBookingService {

    Response saveBooking(Long roomId, Long userId, Booking bookingRequest);

    Response findBookingByConfirmationCode(String confirmationCode);

    Response getAllBookings();

    Response cancelBooking(Long bookingId);

}
