import { useState } from "react";
import { getMovies } from "@/api/movieApi.js";
import { getShowtimes } from "@/api/showtimeApi.js";
import { getPricingRules } from "@/api/pricingApi.js";
import { createBooking } from "@/api/bookingApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import SeatMap from "@/components/SeatMap";
import { calculatePrice } from "@/utils/calculatePrice.js";
import "./CreateBooking.css";

export default function CreateBooking() {
    const [selectedMovie, setSelectedMovie] = useState("");
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [message, setMessage] = useState("");

    const { data: movies, loading: loadingMovies, error: errorMovies } = useFetch(getMovies, null, []);
    const { data: allShowtimes, loading: loadingShowtime, error: errorShowtime } = useFetch(getShowtimes, null, []);
    const showtimes = allShowtimes?.filter(s => s.movieId === selectedMovie) || [];
    const { data: pricingRules } = useFetch(getPricingRules, selectedShowtime, [selectedShowtime]);

    const handleCreateBooking = async () => {
        if (selectedSeats.length === 0) {
            setMessage("Please select atleast one seat.");
            return;
        }
        try {
            const basePrice = 200;
            const finalPrice = calculatePrice(basePrice, pricingRules || []);

            await createBooking({
                showtimeId: selectedShowtime,
                seats: selectedSeats,
                customerName,
                customerPhone,
                price: finalPrice * selectedSeats.length,
                bookedByStaff: true
            });

            setMessage("Booking created successfully");
            setSelectedSeats([]);
        } catch (err) {
            setMessage("Failed to create Booking");
        }
    };

    if (loadingMovies) return <p>Loading movies...</p>;
    if (errorMovies) return <p>Error loading movies.</p>;

    return (
        <div className="staff-booking-page">
            <h2>Staff Booking</h2>

            {message && <p>{message}</p>}

            <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)}>
                <option value="">Select a Movie</option>
                {movies?.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                ))}
            </select>

            {selectedMovie && (
                <select value={selectedShowtime} onChange={(e) => setSelectedShowtime(e.target.value)}>
                    <option value="">Select a showtime</option>
                    {showtimes.map(s => (
                        <option key={s._id} value={s._id}>
                            {new Date(s.startTime).toLocaleString()}
                        </option>
                    ))}
                </select>
            )}

            {selectedShowtime && (
                <SeatMap showtimeId={selectedShowtime}
                    selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats}
                />
            )}

            <div className="customer-info">
                <input
                    type="text"
                    placeholder="Customer Name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Customer Phone (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                />
            </div>

            {selectedSeats.length > 0 && (
                <button onClick={handleCreateBooking}>
                    Booking ({selectedSeats.length} {selectedSeats.length === 1 ? " seat" : " seats"})
                </button>
            )}
        </div>
    );
}