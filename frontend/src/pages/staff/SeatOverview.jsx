import { useFetch } from "@/hooks/useFetch.js";
import { getShowtimes } from "@/api/showtimeApi.js";
import SeatMap from "@/components/SeatMap";
import { useState } from "react";
import "./SeatOverview.css";

export default function SeatOverview() {
    const { data: showtimes, loading, error } = useFetch(getShowtimes);
    const [selectedShowtime, setSelectedShowtime] = useState(null);

    if (loading) return <p>Loading showtimes...</p>;
    if (error) return <p>Error loading showtimes</p>;

    return (
        <div className="seat-overview-page">
            <h2>Seat Overview</h2>
            <select onChange={(e) => setSelectedShowtime(e.target.value)}>
                <option value="">Select a showtime</option>
                {showtimes.map((s) => (
                    <option key={s._id} value={s._id}>
                        {s.movieTitle} - {new Date(s.startTime).toLocaleString()}
                    </option>
                ))}
            </select>

            {selectedShowtime && (
                <SeatMap showtimeId={selectedShowtime} seats={[]} onSelect={() => { }} selected={[]} />
            )}
        </div>
    );
}