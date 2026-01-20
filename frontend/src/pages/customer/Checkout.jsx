import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "@/api/bookingApi.js";
import "./Checkout.css";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const handleConfirm = async () => {
        try {
            const res = await createBooking({
                showtimeId: state?.showtimeId,
                seats: state?.seats || []
            });
            navigate("/tickets", { state: { bookingId: res.data._id } });
        } catch (err) {
            console.error("Booking failed:", err);
        }
    };

    if (!state) return <p>No checkout data provided.</p>;

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            {state.showtime ? (
                <>
                    <p><strong>Movie:</strong> {state.showtime.movieTitle}</p>
                    <p><strong>Showtime:</strong> {new Date(state.showtime.startTime).toLocaleDateString()}</p>
                </>
            ) : (
                <p><strong>Showtime ID:</strong> {state.showtimeId}</p>
            )}
            {state.seats?.length ? (
                <p><strong>Seats:</strong> {state.seats.join(", ")}</p>
            ) : (
                <p>No Seats selected.</p>
            )}
            <button onClick={handleConfirm}>Confirm Booking</button>
        </div>
    );
}