import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const customerLinks = (
        <>
            <Link to="/">Browse</Link>
            <Link to="/showtimes">Showtimes</Link>
            <Link to="/seats/:showtimeId">Select Seat</Link>
            <Link to="/checkout">Check Out</Link>
            <Link to="/tickets">My Tickets</Link>
            <Link to="/my-bookings">My Bookings</Link>
        </>
    );

    const staffLinks = (
        <>
            <Link to="/staff">Scanner</Link>
            <Link to="/staff/book">Book Tickets</Link>
            <Link to="/staff/seats">Seat Overview</Link>
            <Link to="/staff/concessions">Concessions</Link>
        </>
    );

    const managerLinks = (
        <>
            <Link to="/manager">Scheduler</Link>
            <Link to="/manager/theatres">Theatre Management</Link>
            <Link to="/manager/movies">Movie Management</Link>
            <Link to="/manager/pricing">Pricing Rules</Link>
            <Link to="/manager/refunds">Refunds</Link>
            <Link to="/manager/analytics">Analytics</Link>
        </>
    );

    const adminLinks = (
        <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">User Management</Link>
            <Link to="/admin/movies">Movie Management</Link>
            <Link to="/admin/theatres">Theatre Management</Link>
            <Link to="/admin/pricings">Pricing Rules Management</Link>
            <Link to="/admin/analytics">System Analytics</Link>
            <Link to="/admin/concessions">Concessions Management</Link>
            <Link to="/admin/bookings">Booking Overview</Link>
            <Link to="/admin/seats">Seat Editor</Link>
        </>
    )

    return (
        <nav className={`navbar ${theme}`}>
            <h1>
                {user?.role === "staff"
                    ? "Staff Kiosk"
                    : user?.role === "manager"
                        ? "Manager Dashboard"
                        : user?.role === "admin"
                            ? "Admin Dashboard"
                            : "🎬 Movie Theatre"}
            </h1>
            <div className="links">
                {user?.role === "customer" && customerLinks}
                {user?.role === "staff" && staffLinks}
                {user?.role === "manager" && managerLinks}
                {user?.role === "admin" && adminLinks}
                <button onClick={toggleTheme}>
                    {theme === "light" ? "🌙 Dark" : "☀ Light"}
                </button>
                {user ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}