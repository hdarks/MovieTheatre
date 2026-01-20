import { useState } from "react";
import { getUsersByRole, registerUser, deleteUser } from "@/api/userApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import "./UserManager.css";

export default function UserManager() {
    const roles = ["customer", "staff", "manager"];
    const [selectedRole, setSelectedRole] = useState("customer");

    const { data: users, loading, error, refetch } = useFetch(
        () => getUsersByRole(selectedRole),
        null,
        [selectedRole]
    );

    const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            await registerUser(form);
            setMessage("Registered User Successfully ✅");
            setForm({ name: "", email: "", password: "", role: "staff" });
            refetch();
        } catch (err) {
            setMessage("❌ Failed to register user");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setMessage("User deleted successfully");
            refetch();
        } catch (err) {
            setMessage("Failed to delete user");
        }
    };

    return (
        <div className="user-manager">
            <h2>👥 User Management</h2>
            {message && <p>{message}</p>}

            <div className="role-tabs">
                {roles.map((r) => (
                    <button key={r} className={selectedRole === r ? "active" : ""}
                        onClick={() => setSelectedRole(r)}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}s
                    </button>
                ))}
            </div>

            {selectedRole !== "customer" && (
                <div className="user-form">
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                    </select>
                    <button onClick={handleRegister}>Register User</button>
                </div>
            )}

            {loading && <p>Loading {selectedRole}s...</p>}
            {error && <p>Error loading {selectedRole}s</p>}
            <ul className="user-list">
                {users?.map((u) => (
                    <li key={u._id}>
                        <strong>{u.name}</strong>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                        <span> - {u.email}</span>
                        <button onClick={handleDelete}>Delete User</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}