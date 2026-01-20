import { useState } from "react";
import { registerUser } from "@/api/userApi.js";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer"
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ ...form, role: "customer" });
            navigate("/login");
        } catch (err) {
            setError("Registration failed. Please try again!");
        }
    };

    return (
        <div className="auth-page">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Full Name"
                    value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email"
                    value={form.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password"
                    value={form.password} onChange={handleChange} required />
                <input type="hidden" name="role" value="customer" />
                <button type="submit">Register</button>
            </form>
            {error && <p className="error">{error}</p>}
            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    );
}