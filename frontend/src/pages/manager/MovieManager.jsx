import { useState } from "react";
import { useFetch } from "@/hooks/useFetch.js";
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } from "@/api/movieApi.js";
import { useAuth } from "@/context/AuthContext";
import "./MovieManager.css";

export default function MovieManager() {
    const { data: movies, loading, error } = useFetch(getMovies, null, []);
    const { user } = useAuth();

    const [form, setForm] = useState({
        title: "",
        description: "",
        durationMin: "",
        genres: "",
        languages: "",
        rating: "",
        posterUrl: "",
        trailerUrl: "",
        active: true
    });

    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            durationMin: "",
            genres: "",
            languages: "",
            rating: "",
            posterUrl: "",
            trailerUrl: "",
            active: true
        });
        setEditingId(null);
    };

    const handleCreate = async () => {
        try {
            const payload = {
                ...form,
                genres: form.genres ? form.genres.split(",").map((g) => g.trim()).filter(Boolean) : [],
                languages: form.languages ? form.languages.split(",").map((l) => l.trim()).filter(Boolean) : [],
                durationMin: Number(form.durationMin)
            };
            await createMovie(payload);
            setMessage("Movie created successfully");
            resetForm();
            window.location.reload();
        } catch (err) {
            setMessage("Failed to create movie");
        }
    };

    const handleUpdate = async () => {
        try {
            await updateMovie(editingId, {
                ...form,
                genres: form.genres.split(",").map((g) => g.trim()),
                languages: form.languages.split(",").map((l) => l.trim()),
                durationMin: Number(form.durationMin)
            });

            setMessage("Movie updated successfully");
            resetForm();
            window.location.reload();
        } catch (err) {
            setMessage("Failed to update movie");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMovie(id);
            setMessage("Movie deleted successfully");
            window.location.reload();
        } catch (err) {
            setMessage("Failed to delete movie");
        }
    };

    const startEdit = (movie) => {
        setEditingId(movie._id);
        setForm({
            title: movie.title,
            description: movie.description,
            durationMin: movie.durationMin,
            genres: movie.genres.join(", "),
            languages: movie.languages.join(", "),
            rating: movie.rating,
            posterUrl: movie.posterUrl,
            trailerUrl: movie.trailerUrl,
            active: movie.active
        });
    };

    if (loading) return <p>Loading movies...</p>;
    if (error) return <p>Error loading movies</p>;

    return (
        <div className="movie-manager">
            <h2>Movie Management</h2>

            {message && <p>{message}</p>}

            <div className="movie-form">
                <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                <input name="durationMin" type="number" placeholder="Duration (minutes)" value={form.durationMin} onChange={handleChange} />
                <input name="genres" placeholder="Genres (comma seperated)" value={form.genres} onChange={handleChange} />
                <input name="languages" placeholder="Languages (comma seperated)" value={form.languages} onChange={handleChange} />
                <select name="rating" value={form.rating} onChange={handleChange}>
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                    <option value="R">R</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                </select>
                <input name="posterUrl" placeholder="Poster URL" value={form.posterUrl} onChange={handleChange} />
                <input name="trailerUrl" placeholder="Trailer URL (optional)" value={form.trailerUrl} onChange={handleChange} />
                <label>
                    <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />Active
                </label>

                {editingId ? (
                    <button onClick={handleUpdate}>Update Movie</button>
                ) : (
                    <button onClick={handleCreate}>Create Movie</button>
                )}

                {editingId && <button onClick={resetForm}>Cancel Edit</button>}
            </div>

            <ul className="movie-list">
                {movies?.map((movie) => (
                    <li key={movie._id} className="movie-item">
                        <img src={movie.posterUrl} alt={movie.title} width="80" />

                        <strong>{movie.title}</strong>
                        <p>{movie.description}</p>
                        <p>Duration: {movie.durationMin} min</p>
                        <p>Genres: {movie.genres.join(", ")}</p>
                        <p>Languages: {movie.languages.join(", ")}</p>
                        <p>Rating: {movie.rating}</p>
                        <p>Status: {movie.active ? "Active" : "Inactive"}</p>

                        <button onClick={() => startEdit(movie)}>Edit</button>
                        {user?.role === "admin" && (
                            <button onClick={() => handleDelete(movie._id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}