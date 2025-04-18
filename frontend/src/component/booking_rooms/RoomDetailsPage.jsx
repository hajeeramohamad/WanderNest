import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ErrorMessage = ({ messages }) => (
  <div className="error-messages">
    {messages.map((msg, index) => (
      <p key={index} className="error-message">
        ⚠️ {msg}
      </p>
    ))}
  </div>
);

const SuccessMessage = ({ message, onClose }) => (
  <div className="success-message">
    <span>✅ {message}</span>
    <button onClick={onClose} className="close-message">
      &times;
    </button>
  </div>
);

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();

  const [checkInDate, setCheckInDate] = useState(
    location.state?.selectedDates?.checkIn || null
  );
  const [checkOutDate, setCheckOutDate] = useState(
    location.state?.selectedDates?.checkOut || null
  );
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [errors, setErrors] = useState({
    checkIn: [],
    checkOut: [],
    general: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
        const userProfile = await ApiService.getUserProfile();
        setUserId(userProfile.user.id);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const validateDates = () => {
    const newErrors = { checkIn: [], checkOut: [], general: [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = today.getTime();
    const inTime = checkInDate?.getTime();
    const outTime = checkOutDate?.getTime();

    if (!checkInDate) newErrors.checkIn.push("Please select check-in date");
    else if (inTime < now) newErrors.checkIn.push("Cannot be in the past");

    if (!checkOutDate) newErrors.checkOut.push("Please select check-out date");
    else if (outTime <= now) newErrors.checkOut.push("Must be in the future");

    if (checkInDate && checkOutDate && outTime <= inTime)
      newErrors.checkOut.push("Must be after check-in date");

    return newErrors;
  };

  const handleConfirmBooking = () => {
    setErrors({ checkIn: [], checkOut: [], general: [] });
    const vErr = validateDates();
    setErrors(vErr);
    if (Object.values(vErr).some((arr) => arr.length)) return;

    const oneDay = 24 * 60 * 60 * 1000;
    const days =
      Math.round(Math.abs((checkOutDate - checkInDate) / oneDay)) + 1;
    setTotalPrice(roomDetails.roomPrice * days);
    setTotalGuests(numAdults + numChildren);
  };

  const acceptBooking = async () => {
    setErrors({ checkIn: [], checkOut: [], general: [] });
    const vErr = validateDates();
    setErrors(vErr);
    if (Object.values(vErr).some((arr) => arr.length)) return;

    try {
      const booking = {
        checkInDate: checkInDate.toISOString().split("T")[0],
        checkOutDate: checkOutDate.toISOString().split("T")[0],
        numOfAdults: numAdults,
        numOfChildren: numChildren,
      };
      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate("/rooms");
        }, 10000);
      }
    } catch (err) {
      console.error("Booking error:", err);
      const resp = err.response?.data;
      const parsed = { checkIn: [], checkOut: [], general: [] };

      // Map date validation errors to a user-friendly message
      if (Array.isArray(resp?.errors) && resp.errors.length) {
        resp.errors.forEach((e) => {
          if (e.includes("checkInDate") || e.includes("checkOutDate")) {
            parsed.general.push("please enter a valid date");
          } else {
            parsed.general.push(e.replace(/.*?: /, ""));
          }
        });
      } else if (resp?.message?.includes("Validation failed")) {
        // Fallback for Jakarta validation messages
        parsed.general.push("please enter a valid date");
      } else {
        parsed.general.push(resp?.message || err.message);
      }

      setErrors(parsed);
    }
  };

  if (isLoading) return <p className="room-detail-loading">Loading...</p>;
  if (error) return <p className="room-detail-loading">{error}</p>;
  if (!roomDetails)
    return <p className="room-detail-loading">Room not found</p>;

  const { roomType, roomPrice, roomPhotoUrl, description, bookings } =
    roomDetails;

  return (
    <div className="booking-form">
      {showMessage && (
        <SuccessMessage
          message={`Booking successful! Code: ${confirmationCode}`}
          onClose={() => setShowMessage(false)}
        />
      )}

      {errors.general.length > 0 && <ErrorMessage messages={errors.general} />}

      <h2>{roomType}</h2>
      <img src={roomPhotoUrl} alt={roomType} className="room-details-image" />
      <div className="room-details-info">
        <p>&#8377;{roomPrice}/night</p>
        <p>{description}</p>
      </div>

      {bookings?.length > 0 && (
        <div>
          <h3>Existing Bookings</h3>
          <ul className="booking-list">
            {bookings.map((b, i) => (
              <li key={b.id}>
                Booking {i + 1}: {b.checkInDate} to {b.checkOutDate}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="booking-info">
        <button onClick={() => setShowDatePicker(true)}>Book Now</button>
        {showDatePicker && (
          <div className="booking-form">
            <div className="date-picker-container">
              <div className="date-picker-group">
                <label>Check-in Date</label>
                <DatePicker
                  className={`detail-search-field ${
                    errors.checkIn.length ? "error-field" : ""
                  }`}
                  selected={checkInDate}
                  onChange={(d) => setCheckInDate(d)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={new Date()}
                />
                <ErrorMessage messages={errors.checkIn} />
              </div>

              <div className="date-picker-group">
                <label>Check-out Date</label>
                <DatePicker
                  className={`detail-search-field ${
                    errors.checkOut.length ? "error-field" : ""
                  }`}
                  selected={checkOutDate}
                  onChange={(d) => setCheckOutDate(d)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={
                    checkInDate
                      ? new Date(checkInDate.getTime() + 86400000)
                      : new Date()
                  }
                  disabled={!checkInDate}
                />
                <ErrorMessage messages={errors.checkOut} />
              </div>
            </div>

            <div className="guest-container">
              <div className="guest-div">
                <label>Adults</label>
                <input
                  type="number"
                  min="1"
                  value={numAdults}
                  onChange={(e) => setNumAdults(Math.max(1, +e.target.value))}
                />
              </div>

              <div className="guest-div">
                <label>Children</label>
                <input
                  type="number"
                  min="0"
                  value={numChildren}
                  onChange={(e) => setNumChildren(Math.max(0, +e.target.value))}
                />
              </div>
            </div>

            <button className="confirm-booking" onClick={handleConfirmBooking}>
              Calculate Price
            </button>

            {totalPrice > 0 && (
              <div className="total-price">
                <p>Total Price: &#8377;{totalPrice}</p>
                <p>Total Guests: {totalGuests}</p>
                <button
                  className="confirm-booking"
                  onClick={acceptBooking}
                  style={{ marginTop: "1rem" }}
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
