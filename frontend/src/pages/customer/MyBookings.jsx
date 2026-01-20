import { useFetch } from "@/hooks/useFetch.js";
import { getUserBookings, cancelBooking } from "@/api/bookingApi.js";
import { formatDate } from "@/utils/formatDate.js";
import { useState } from "react";
import "./MyBookings.css";

export default function MyBookings() {
    const { data: bookings, loading, error } = useFetch(getUserBookings, null, []);
    const [message, setMessage] = useState("");

    if (loading) return <p>Loading your bookings...</p>;
    if (error) return <p>Error loading your bookings</p>;

    const handleCancel = async (id) => {
        try {
            await cancelBooking(id);
            setMessage("Booking cancelled");
        } catch (err) {
            setMessage("Failed to cancel booking.");
        }
    };

    return (
        <div className="my-bookings">
            <h2>Your Bookings</h2>
            {message && <p>{message}</p>}

            {bookings.length === 0 && <p>No Bookings found</p>}

            <ul>
                {bookings.map((b) => (
                    <li key={b._id}>
                        <strong>{b.movieTitle}</strong>
                        <p>{formatDate(b.showtime)}</p>
                        <p>Seats: {b.seats.join(", ")}</p>
                        <p>Status: {b.status}</p>

                        {b.status === "confirmed" && (
                            <button onClick={() => handleCancel(b._id)}>Cancel</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}