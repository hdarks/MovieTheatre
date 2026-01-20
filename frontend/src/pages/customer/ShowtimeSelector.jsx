import { useSearchParams, Link } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch.js";
import { getShowtimes } from "@/api/showtimeApi.js";
import "./ShowtimeSelector.css";

export default function ShowtimeSelector() {
    const [params] = useSearchParams();
    const movieId = params.get("movie");

    const { data: showtimes, loading, error } = useFetch(getShowtimes);

    if (loading) return <p>Loading showtimes...</p>;
    if (error) return <p>Error loading showtimes</p>;

    const filtered = showtimes.filter((s) => {
        if (typeof s.movieId === "object" && s.movieId?._id) {
            return s.movieId._id === movieId;
        }
        return s.movieId === movieId;
    });

    return (
        <div className="showtime-page">
            <h2>Select Showtime</h2>
            {filtered.length === 0 && <p>😔 No showtimes available for this movie.</p>}
            <ul>
                {filtered.map((s) => (
                    <li key={s._id}>
                        <Link to={`/seats/${s._id}`}>
                            {new Date(s.startTime).toLocaleString()} - {s.theatreName}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}