import { useState } from "react";
import { useFetch } from "@/hooks/useFetch.js";
import { refundBooking, getBookings } from "@/api/bookingApi.js";
import { formatDate } from "@/utils/formatDate.js";
import "./BookingOverview.css";

export default function BookingOverview() {
    const { data: bookings, loading, error } = useFetch(getBookings, null, []);
    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(text), 3000);
    };

    const handleRefund = async (id) => {
        try {
            await refundBooking(id);
            showMessage("Booking Refunded");
            const updated = bookings.map((b) => b._id === id ? { ...b, status: "refunded" } : b);
            bookings.splice(0, bookings.length, ...updated);
        } catch (err) {
            showMessage("Failed to refund booking.");
        }
    };

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p>Error loading bookings.</p>;

    return (
        <div className="booking-admin">
            <h2>🎫 Booking Overview (Admin)</h2>
            {message && <p className="message">{message}</p>}
            {bookings.length === 0 && <p>No Bookings yet.</p>}

            <ul className="booking-list">
                {bookings.map((b) => (
                    <li key={b._id} className="booking-item">
                        <strong>{b.movieTitle}</strong>
                        <p>Showtime: {formatDate(b.showtime)}</p>
                        <p>Seats: {b.seats.join(", ")}</p>
                        <span className={`badge ${b.status}`}>{b.status}</span>

                        {b.status === "cancelled" && (
                            <button className="btn refund" onClick={() => handleRefund(b._id)}>
                                Refund
                            </button>
                        )}
                        {b.status === "refunded" && (
                            <span className="refunded-label">Refunded</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}