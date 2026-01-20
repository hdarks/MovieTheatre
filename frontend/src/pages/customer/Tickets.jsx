import { useLocation } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch";
import { getBookingById } from "@/api/bookingApi";
import "./Tickets.css";

export default function Tickets() {
    const { state } = useLocation();
    const bookingId = state?.bookingId;

    const { data: booking, loading, error } = useFetch(() => getBookingById(bookingId), null, [bookingId]);

    if (loading) return <p>Loading ticket...</p>;
    if (error) return <p>Error laoding ticket</p>;

    return (
        <div className="tickets-page">
            <h2>Your Ticket</h2>
            <p><strong>Movie:</strong> {booking.movieTitle}</p>
            <p><strong>Showtime:</strong> {new Date(booking.showtime.startTime).toLocaleString()}</p>
            <p><strong>Seats:</strong> {booking.seats.join(", ")}</p>
            <p className={booking.status === "cancelled" ? "cancelled" : ""}>
                <strong>Status:</strong> {booking.status}
            </p>
            <img src={booking.qrCodeUrl} alt="Ticket QR" />
        </div>
    );
}