package com.wandernest.WanderNest.repo;

import com.wandernest.WanderNest.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<com.wandernest.WanderNest.entity.Booking, Long> {

    Optional<com.wandernest.WanderNest.entity.Booking> findByBookingConfirmationCode(String confirmationCode);
}
