import { useFetch } from "@/hooks/useFetch.js";
import { getMovies } from "@/api/movieApi.js";
import Card from "@/components/Card";
import "./Browse.css";

export default function Browse() {
    const { data: movies, loading, error } = useFetch(getMovies);

    if (loading) return <p>Loading movies...</p>;
    if (error) return <p>Error loading movies</p>;

    return (
        <div className="browse-page">
            <h2>Browse Movies</h2>
            <div className="grid">
                {movies.map((m) => (
                    <Card
                        key={m._id}
                        image={m.posterUrl}
                        title={m.title}
                        subtitle={Array.isArray(m.genre)
                            ? m.genre.join(", ") : m.genre?.name || m.genre || "Unknown"
                        }
                        onClick={() => (window.location.href = `/showtimes?movie=${m._id}`)}
                    />
                ))}
            </div>
        </div>
    );
}