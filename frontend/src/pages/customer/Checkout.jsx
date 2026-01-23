import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "@/api/bookingApi.js";
import { calculatePrice } from "@/utils/calculatePrice.js";
import "./Checkout.css";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const handleConfirm = async () => {
        try {
            const res = await createBooking({
                showtimeId: state?.showtimeId,
                seats: state?.seats || [],
                payment: {
                    provider: "mock",
                    intentId: uuidv4(),
                    amount: formattedSeats.reduce((sum, s) => sum + s.pricePaid, 0),
                    currency: "INR",
                    captured: "false"
                }
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
                    <div className="checkout-details">
                        <p><strong>Movie:</strong> {state.showtime.movieTitle}</p>
                        <p><strong>Showtime:</strong> {new Date(state.showtime.startTime).toLocaleDateString()}</p>
                        {state.showtime.theatreName && (
                            <p><strong>Theatre: </strong>{state.showtime.theatreName}</p>
                        )}
                    </div>
                </>
            ) : (
                <p><strong>Showtime ID:</strong> {state.showtimeId}</p>
            )}
            {state.seats?.length ? (
                <div className="checkout-seats">
                    <p><strong>Seats:</strong></p>
                    <ul>
                        {state.seats.map((s, i) => (
                            <li key={i}>
                                {s.seatKey} - ₹{s.pricePaid}
                            </li>
                        ))}
                    </ul>
                    <p><strong>Total Price: </strong>₹{state.seats.reduce((sum, s) => sum + s.pricePaid, 0)}</p>
                </div>
            ) : (
                <p>No Seats selected.</p>
            )}
            <button onClick={handleConfirm}>Confirm Booking</button>
        </div>
    );
}