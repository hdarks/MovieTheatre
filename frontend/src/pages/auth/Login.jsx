import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(form);

            const loggedInUser = JSON.parse(localStorage.getItem("user"));
            if (loggedInUser.role === "customer") {
                navigate("/");
            } else if (loggedInUser.role === "staff") {
                navigate("/staff");
            } else if (loggedInUser.role === "manager") {
                navigate("/manager");
            } else if (loggedInUser.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/login");
            }
        } catch (err) {
            setError("Invalid credentials. Please try again!");
        }
    };

    return (
        <div className="auth-page">
            <h2>🔑 Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email"
                    value={form.email} onChange={handleChange} required
                />
                <input type="password" name="password" placeholder="Password"
                    value={form.password} onChange={handleChange} required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
            <p>
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
}