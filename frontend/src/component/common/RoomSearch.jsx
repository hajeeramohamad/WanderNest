import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiService from "../../service/ApiService";

const RoomSearch = ({ handleSearchResult, onDatesChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");

  const getTodayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error) {
        console.error("Error fetching room types:", error.message);
      }
    };
    fetchRoomTypes();
  }, []);

  const showError = (message, timeout = 5000) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, timeout);
  };

  const handleInternalSearch = async () => {
    setError("");

    if (!startDate || !endDate || !roomType) {
      showError("Please select all fields");
      return;
    }

    const today = getTodayMidnight();
    const checkIn = new Date(startDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(endDate);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      showError("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      showError("Check-out date must be after check-in date");
      return;
    }

    try {
      onDatesChange(startDate, endDate);
      const formattedStartDate = checkIn.toISOString().split("T")[0];
      const formattedEndDate = checkOut.toISOString().split("T")[0];

      const response = await ApiService.getAvailableRoomsByDateAndType(
        formattedStartDate,
        formattedEndDate,
        roomType
      );

      if (response.statusCode === 200) {
        if (response.roomList.length === 0) {
          showError("No rooms available for selected dates and room type");
          return;
        }
        handleSearchResult(response.roomList);
        setError("");
      }
    } catch (error) {
      showError(
        "Unknown error occurred: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <section>
      <div className="search-container">
        <div className="search-field">
          <label>Check-in Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              setEndDate(null);
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Check-in Date"
            minDate={getTodayMidnight()}
          />
        </div>
        <div className="search-field">
          <label>Check-out Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Check-out Date"
            minDate={
              startDate
                ? new Date(startDate.getTime() + 86400000)
                : getTodayMidnight()
            }
            disabled={!startDate}
          />
        </div>
        <div className="search-field">
          <label>Room Type</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option disabled value="">
              Select Room Type
            </option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button className="home-search-button" onClick={handleInternalSearch}>
          Search Rooms
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </section>
  );
};

export default RoomSearch;
