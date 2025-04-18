package com.wandernest.WanderNest.config;

import com.wandernest.WanderNest.entity.Room;
import com.wandernest.WanderNest.repo.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(RoomRepository roomRepository) {
        return args -> {
            if (roomRepository.count() == 0) {
                // Create 5 Deluxe Rooms
                for (int i = 1; i <= 5; i++) {
                    Room room = new Room();
                    room.setRoomType("Deluxe");
                    room.setRoomPrice(new BigDecimal("2000"));
                    room.setRoomDescription("Luxury deluxe room " + i);
                    room.setRoomPhotoUrl("https://example.com/deluxe.jpg");
                    roomRepository.save(room);
                }

                // Create 3 Standard Rooms
                for (int i = 1; i <= 3; i++) {
                    Room room = new Room();
                    room.setRoomType("Standard");
                    room.setRoomPrice(new BigDecimal("1000"));
                    room.setRoomDescription("Standard room " + i);
                    room.setRoomPhotoUrl("https://example.com/standard.jpg");
                    roomRepository.save(room);
                }
            }
        };
    }
}
