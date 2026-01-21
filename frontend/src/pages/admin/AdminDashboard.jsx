import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <h1>🛠 Admin Dashboard</h1>
            <p className="subtitle">Welcome, Admin! Manage your System from here.</p>

            <div className="dashboard-grid">
                <div className="card">
                    <h2>🎬 Movies</h2>
                    <p>Manage movie listings, trailers, and metadata.</p>
                    <Link to="/admin/movies" className="btn">Go to Movie Manager</Link>
                </div>
                <div className="card">
                    <h2>🎭 Theatres</h2>
                    <p>Manage movie listings, trailers, and metadata.</p>
                    <Link to="/admin/movies" className="btn">Go to Movie Manager</Link>
                </div>
                <div className="card">
                    <h2>👥 User Manager</h2>
                    <p>View information of all the users and employees.</p>
                    <Link to="/admin/users" className="btn">Go to User Manager</Link>
                </div>
                <div className="card">
                    <h2>🍿 Concessions</h2>
                    <p>Manage food, drinks, and merchandise inventory.</p>
                    <Link to="/admin/concessions" className="btn">Go to Concession Manager</Link>
                </div>
                <div className="card">
                    <h2>💰 Pricing Rules</h2>
                    <p>Configure dynamic pricing rules for showtimes.</p>
                    <Link to="/admin/pricings" className="btn">Go to Pricing Rules</Link>
                </div>
                <div className="card">
                    <h2>🎟️ Bookings</h2>
                    <p>View bookings and process refunds.</p>
                    <Link to="/admin/bookings" className="btn">Go to Booking Overview</Link>
                </div>
                <div className="card">
                    <h2>📊 Analytics</h2>
                    <p>View system-wide analytics and insights.</p>
                    <Link to="/admin/analytics" className="btn">Go to System Analytics</Link>
                </div>
                <div className="card">
                    <h2>💺 Seat Editor</h2>
                    <p>View and Edit seat layout for the screens.</p>
                    <Link to="/admin/seats" className="btn">Go to Seat Editor</Link>
                </div>
            </div>
        </div>
    );
}