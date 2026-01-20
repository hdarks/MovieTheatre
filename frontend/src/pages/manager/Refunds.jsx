import { useState } from "react";
import { getBookings, refundBooking } from "@/api/bookingApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import { formatDate } from "@/utils/formatDate.js";
import "./Refunds.css";

export default function Refunds() {
    const [message, setMessage] = useState("");

    const { data: bookings, loading, error } = useFetch(getBookings, null, []);

    const handleRefund = async (id) => {
        try {
            await refundBooking(id);
            setMessage("Booking refunded successfully");

            const updated = bookings.map((b) =>
                b._id === id ? { ...b, status: "refunded" } : b
            );

            bookings.splice(0, bookings.length, ...updated);
        } catch (err) {
            setMessage("Failed to refund booking");
        }
    };

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p>Error loading bookings.</p>;

    return (
        <div className="refund-page">
            <h2>Refund Bookings</h2>
            {message && <p>{message}</p>}
            {bookings.length === 0 && <p>No Bookings yet.</p>}

            <ul className="refund-list">
                {bookings.map((b) => (
                    <li key={b._id} className="refund-item">
                        <strong>{b.movieTitle}</strong>
                        <p>Showtime {formatDate(b.showtime)}</p>
                        <p>Seats: {b.seats.join(", ")}</p>
                        <p>Status: {b.status}</p>

                        {b.status === "cancelled" && (
                            <button onClick={() => handleRefund(b._id)}>Refund</button>
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