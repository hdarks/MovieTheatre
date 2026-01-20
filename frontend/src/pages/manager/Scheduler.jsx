import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch.js";
import { createShowtime, updateShowtime, cancelShowtime, getShowtimeById, getShowtimes } from "@/api/showtimeApi.js";
import { getMovies } from "@/api/movieApi.js";
import { getTheatres } from "@/api/theatreApi.js";
import "./Scheduler.css";

export default function Scheduler() {
    const { data: movies, loading: moviesLoading, error: moviesError } = useFetch(getMovies);
    const { data: theatres, loading: theatresLoading, error: theatresError } = useFetch(getTheatres);
    const { data: showtimes, loading: showtimesLoading, error: showtimesError } = useFetch(getShowtimes);
    const [form, setForm] = useState({
        movieId: "",
        theatreId: "",
        screenId: "",
        startTime: "",
        endTime: "",
        language: "",
        format: "",
        basePrice: ""
    });
    const [message, setMessage] = useState(null);
    const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

    const handleChange = async (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createShowtime(form);
            setMessage("Showtime scheduled successfully");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to schedule showtime");
        }
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        try {
            await updateShowtime(id, form);
            setMessage("Showtime updated successfully!");
            const res = await getShowtimes();
            setSelectedShowtimeId(null);
            setForm({ movieId: "", theatreId: "", screenId: "", startTime: "", endTime: "", language: "", format: "", basePrice: "" });
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update showtime.");
        }
    };

    const handleCancel = async (id) => {
        try {
            await cancelShowtime(id);
            setMessage("Showtime cancelled.");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to cancel showtime");
        }
    };

    const handleView = async (id) => {
        try {
            const res = await getShowtimeById(id);
            alert(`Showtime Details:\nMovie: ${res.data.movieId}\nStart: ${res.data.startTime}`);
        } catch (err) {
            setMessage("Failed to fetch showtime details.");
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getShowtimeById(id);
            const st = res.data;
            setForm({
                movieId: st.movieId?._id || st.movieId,
                theatreId: st.theatreId?._id || st.theatreId,
                screenId: st.screenId,
                startTime: toLocaleDatetimeInput(st.startTime),
                endTime: toLocaleDatetimeInput(st.endTime),
                language: st.language || "",
                format: st.format || "",
                basePrice: st.basePrice || ""
            });
            setSelectedShowtimeId(id);
            setMessage("Editing showtime - update fields and save");
        } catch (err) {
            setMessage("Failed to load showtime for editing.");
        }
    };

    const handleCancelEdit = () => {
        setSelectedShowtimeId(null);
        setForm({ movieId: "", theatreId: "", screenId: "", startTime: "", endTime: "", language: "", format: "", basePrice: "" });
        setMessage("Edit cancelled. Form reset to Schedule mode");
    };

    const toLocaleDatetimeInput = (isoString) => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        const localISO = new Date(date - offset).toISOString().slice(0, 16);
        return localISO;
    }

    if (moviesLoading || theatresLoading || showtimesLoading) return <p>Loading...</p>;
    if (moviesError || theatresError || showtimesError) return <p>Error loading</p>;

    return (
        <div className="scheduler-page">
            <h2>Schedule a Showtime</h2>
            <form onSubmit={selectedShowtimeId ? (e) => handleUpdate(e, selectedShowtimeId) : handleCreate} className="scheduler-form">
                <select name="movieId" value={form.movieId} onChange={handleChange} required>
                    <option value="">Select Movie</option>
                    {movies.map((m) => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                </select>
                <select name="theatreId" value={form.theatreId} onChange={handleChange} required>
                    <option value="">Select Theatre</option>
                    {theatres?.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select>
                <input type="text" name="screenId" placeholder="Screen ID"
                    value={form.screenId} onChange={handleChange} required />
                <input type="datetime-local" name="startTime"
                    value={form.startTime} onChange={handleChange} required />
                <input type="datetime-local" name="endTime"
                    value={form.endTime} onChange={handleChange} required />
                <input type="text" name="language" placeholder="Language"
                    value={form.language} onChange={handleChange} />
                <select name="format" value={form.format} onChange={handleChange} required>
                    <option value="">Select Format</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                </select>
                <input type="number" name="basePrice" placeholder="Base Price"
                    value={form.basePrice} onChange={handleChange} />
                <button type="submit">{selectedShowtimeId ? "💾 Save Update" : "➕ Schedule"}</button>
                {selectedShowtimeId && (
                    <button type="button" onClick={handleCancelEdit}>❌ Cancel Edit</button>
                )}
            </form>
            {message && <p>{message}</p>}

            <h3>Existing Showtimes</h3>
            <ul>
                {showtimes?.map((s) => (
                    <li key={s._id}>
                        🎬 {s.movieId?.title} at {s.theatreId?.name} ({s.screenId})
                        ⏰ {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}
                        <button type="button" onClick={() => handleView(s._id)}>View</button>
                        <button type="button" onClick={() => handleEdit(s._id)}>Edit</button>
                        <button type="button" onClick={() => handleCancel(s._id)}>Cancel</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}