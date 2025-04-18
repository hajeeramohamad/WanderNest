package com.wandernest.WanderNest.repo;

import com.wandernest.WanderNest.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT DISTINCT r.roomType FROM Room r")
    List<String> findDistinctRoomTypes();


    @Query("SELECT r FROM Room r WHERE r.roomType LIKE %:roomType% AND r.id NOT IN (SELECT bk.room.id FROM Booking bk WHERE" +
            "(bk.checkInDate <= :checkOutDate) AND (bk.checkOutDate >= :checkInDate))")
    List<Room> findAvailableRoomsByDatesAndTypes(LocalDate checkInDate, LocalDate checkOutDate, String roomType);


    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT b.room.id FROM Booking b)")
    List<Room> getAllAvailableRooms();

    // RoomRepository.java
    @Query("SELECT r.roomType AS roomType, COUNT(r) AS count, MIN(r.roomPrice) AS price " +
            "FROM Room r WHERE " +
            "r.roomType = :roomType AND " +
            "NOT EXISTS (" +
            "  SELECT b FROM Booking b WHERE " +
            "  b.room = r AND " +
            "  (b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate)" +
            ") " +
            "GROUP BY r.roomType")
    List<Object[]> findAvailableRoomCountsByTypeAndDates(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("roomType") String roomType
    );
}
