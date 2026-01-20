import { useState } from "react";
import {
    getConcessions, createConcession,
    updateConcession, deleteConcession, adjustStock
} from "@/api/concessionApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import "./ConcessionsAdmin.css";

export default function ConcessionsAdmin() {
    const { data: concessions, loading, error } = useFetch(getConcessions, null, []);
    const [form, setForm] = useState({
        name: "",
        category: "food",
        price: "",
        stock: 0,
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const resetForm = () => {
        setForm({ name: "", category: "food", price: "", stock: 0, active: true });
        setEditingId(null);
    };

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleCreate = async () => {
        try {
            const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
            const res = await createConcession(payload);
            showMessage("Concession created successfully");
            concessions.push(res.data);
            resetForm();
        } catch (err) {
            showMessage("Failed to create concession");
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = { ...form, price: Number(form.price), stock: Number(form.price) };
            const res = await updateConcession(editingId, payload);
            showMessage("Concession updated sucessfully");
            const idx = concessions.findIndex((c) => c._id === editingId);
            if (idx !== -1) concessions[idx] = res.data;
            resetForm();
        } catch (err) {
            showMessage("Failed to update concession");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteConcession(id);
            showMessage("Deleted concession successfully");
            const idx = concessions.findIndex((c) => c._id === id);
            if (idx !== -1) concessions.splice(idx, 1);
        } catch (err) {
            showMessage("Failed to delete concession");
        }
    };

    const handleAdjustStock = async (id, delta) => {
        try {
            const res = await adjustStock(id, delta);
            showMessage(`Stock adjusted by ${delta}`);
            const idx = concessions.findIndex((c) => c._id === id);
            if (idx !== -1) concessions[idx] = res.data;
        } catch (err) {
            showMessage("Failed to adjust stock");
        }
    };

    const startEdit = (concession) => {
        setEditingId(concession._id);
        setForm({
            name: concession.name,
            category: concession.category,
            price: concession.price,
            stock: concession.stock,
            active: concession.active
        });
    };

    if (loading) return <p>Loading concessions...</p>;
    if (error) return <p>Error loading concessions.</p>;

    return (
        <div className="concession-admin">
            <h2>🍿 Concession Management (Admin)</h2>
            {message && <p className={message ? "" : "hidden"}>{message}</p>}

            <div className="concession-form">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                <select name="category" value={form.category} onChange={handleChange}>
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                    <option value="merch">Merch</option>
                </select>
                <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
                <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
                <label>
                    <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />{" "}
                    Active
                </label>

                {editingId ? (
                    <button onClick={handleUpdate}>Update Concession</button>
                ) : (
                    <button onClick={handleCreate}>CreateConcession</button>
                )}
                {editingId && <button onClick={resetForm}>Cancel Edit</button>}
            </div>

            <ul className="concession-list">
                {concessions?.map((c) => (
                    <li key={c._id} className="concession-item">
                        <strong>{c.name}</strong> - ₹{c.price} - Stock: {c.stock}
                        <div className="badges">
                            <span className={`badge ${c.category}`}>{c.category}</span>
                            <span className={`badge ${c.active ? "active" : "inactive"}`}>
                                {c.active ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div className="actions">
                            <button onClick={() => startEdit(c)}>Edit</button>
                            <button onClick={() => handleDelete(c._id)}>Delete</button>
                            <button onClick={() => handleAdjustStock(c._id, 1)}>+1 Stock</button>
                            <button onClick={() => handleAdjustStock(c._id, -1)}>-1 Stock</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}