import { useState } from "react";
import {
    getTheatres, getTheatreById, createTheatre, deleteTheatre, updateTheatre,
    addScreen, updateScreenLayout, removeScreen
} from "@/api/theatreApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import "./TheatreManagerAdmin.css";

export default function TheatreManagerAdmin() {
    const { data: theatres, loading, error } = useFetch(getTheatres, null, []);
    const [selectedTheatre, setSelectedTheatre] = useState(null);
    const [form, setForm] = useState({ name: "", address: "" });
    const [screenForm, setScreenForm] = useState({ name: "", rows: 0, cols: 0 });

    const handleSelectTheatre = async (id) => {
        const res = await getTheatreById(id);
        setSelectedTheatre(res.data);
        setForm({ name: res.data.name, address: res.data.address });
    };

    const handleCreateTheatre = async () => {
        try {
            const res = await createTheatre(form);
            alert("Theatre created successfully");
            setForm({ name: "", address: "" });
            theatres.push(res.data);
        } catch (err) {
            alert("Failed to create theatre");
        }
    };

    const handleUpdateTheatre = async () => {
        try {
            const res = await updateTheatre(selectedTheatre._id, form);
            alert("Theatre updated successfully");
            setSelectedTheatre(res.data);
            const idx = theatres.findIndex((t) => t._id === res.data._id);
            if (idx !== -1) theatres[idx] = res.data;
        } catch (err) {
            alert("Failed to update theatre");
        }
    };

    const handleDeleteTheatre = async (id) => {
        try {
            await deleteTheatre(id);
            alert("Theatre deleted successfully");
            setSelectedTheatre(null);
            const idx = theatres.findIndex((t) => t._id === id);
            if (idx !== -1) theatres.splice(idx, 1);
        } catch (err) {
            alert("Failed to delete theatre");
        }
    };

    const handleAddScreen = async () => {
        if (!screenForm.name || !screenForm.rows || !screenForm.cols) {
            alert("Please fill all the fields");
            return;
        }
        try {
            await addScreen(selectedTheatre._id, {
                name: screenForm.name,
                layout: {
                    rows: Number(screenForm.rows),
                    cols: Number(screenForm.cols),
                    seats: []
                }
            });
            alert("Screen added successfully");
            await handleSelectTheatre(selectedTheatre._id);
            setScreenForm({ name: "", rows: 0, cols: 0 });
        } catch (err) {
            alert("Failed to add screen");
        }
    };

    const handleUpdateScreen = async (screenId) => {
        try {
            await updateScreenLayout(selectedTheatre._id, screenId, {
                layout: {
                    rows: Number(screenForm.rows),
                    cols: Number(screenForm.cols),
                    seats: []
                },
                name: screenForm.name
            });
            alert("Screen updated successfully");
            await handleSelectTheatre(selectedTheatre._id);
            setScreenForm({ name: "", rows: 0, cols: 0 });
        } catch (err) {
            alert("Failed to update screen");
        }
    };

    const handleRemoveScreen = async (screenId) => {
        try {
            await removeScreen(selectedTheatre._id, screenId);
            alert("Removed screen successfully");
            await handleSelectTheatre(selectedTheatre._id);
        } catch (err) {
            alert("Failed to remove screen");
        }
    };

    if (loading) return <p>Loading theatres...</p>;
    if (error) return <p>Error loading theatres</p>;

    return (
        <div className="theatre-manager">
            <h2 className="title">🎭 Theatre Manager (Admin)</h2>
            <div className="card">
                <h3>Create a Theatre</h3>
                <div className="form-group">
                    <input className="input" placeholder="Name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="input" placeholder="Address" value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={handleCreateTheatre}>Create Theatre</button>
            </div>
            <div className="card">
                <h3>All Theatres</h3>
                <ul className="list">
                    {theatres?.map((t) => (
                        <li key={t._id} className="list-item">
                            <button className="btn-link" onClick={() => handleSelectTheatre(t._id)}>{t.name}</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteTheatre(t._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedTheatre && (
                <div className="card">
                    <h3>Edit Theatre: {selectedTheatre.name}</h3>
                    <div className="form-group">
                        <input className="input" placeholder="Name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input" placeholder="Address" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <button className="btn btn-success" onClick={handleUpdateTheatre}>Update Theatre</button>

                    <h4>Screens</h4>
                    {selectedTheatre.screens.length > 0 ? (
                        <ul className="list">
                            {selectedTheatre.screens.map((s) => (
                                <li key={s._id} className="list-item">
                                    {s.name} ({s.layout.rows} X {s.layout.cols})
                                    <button className="btn btn-warning" onClick={() => handleUpdateScreen(s._id)}>Update Screen</button>
                                    <button className="btn btn-danger" onClick={() => handleRemoveScreen(s._id)}>Remove Screen</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Screens in {selectedTheatre.name}</p>
                    )}

                    <div className="form-group">
                        <h4>Add new Screen</h4>
                        <input className="input" placeholder="Name" value={screenForm.name}
                            onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} />
                        <input className="input" type="Number" placeholder="Rows" value={screenForm.rows}
                            onChange={(e) => setScreenForm({ ...screenForm, rows: e.target.value })} />
                        <input className="input" type="Number" placeholder="Columns" value={screenForm.cols}
                            onChange={(e) => setScreenForm({ ...screenForm, cols: e.target.value })} />
                        <button className="btn btn-primary" onClick={handleAddScreen}>Add Screen</button>
                    </div>
                </div>
            )}
        </div>
    );
}