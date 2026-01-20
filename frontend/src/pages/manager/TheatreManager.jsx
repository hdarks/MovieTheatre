import { useState, useEffect } from "react";
import {
    getTheatres, getTheatreById, createTheatre, deleteTheatre, updateTheatre,
    addScreen, updateScreenLayout, removeScreen
} from "@/api/theatreApi";
import { useRole } from "@/context/RoleContext";
import { useFetch } from "@/hooks/useFetch.js"
import "./TheatreManager.css";

export default function TheatreManager() {
    const { isManager, isAdmin } = useRole();

    const { data: theatres, loading, error } = useFetch(getTheatres, null, []);

    const [selectedTheatre, setSelectedTheatre] = useState(null);
    const [form, setForm] = useState({ name: "", address: "" });
    const [screenForm, setScreenForm] = useState({ screenId: "", name: "", rows: 0, cols: 0 });

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
            window.location.reload();
        } catch (err) {
            alert("Failed to create Theatre");
        }
    };

    const handleUpdateTheatre = async () => {
        try {
            const res = await updateTheatre(selectedTheatre._id, form);
            alert("Theatre updated successfully");
            setSelectedTheatre(res.data);
            window.location.reload();
        } catch (err) {
            alert("Failed to Update theatre");
        }
    };

    const handleDeleteTheatre = async (id) => {
        try {
            await deleteTheatre(id);
            alert("Theatre deleted successfully");
            setSelectedTheatre(null);
            window.location.reload();
        } catch (err) {
            alert("Failed to delete theatre");
        }
    };

    const handleAddScreen = async () => {
        try {
            await addScreen(selectedTheatre._id, {
                screenId: screenForm.screenId,
                name: screenForm.name,
                layout: {
                    rows: Number(screenForm.rows),
                    cols: Number(screenForm.cols),
                    seats: []
                }
            });
            alert("Screen added successfully!");
            await handleSelectTheatre(selectedTheatre._id);
            setScreenForm({ screenId: "", name: "", rows: 0, cols: 0 });
        } catch (err) {
            alert("Failed to add screen!");
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
            alert("Screen Updated Successfully");
            await handleSelectTheatre(selectedTheatre._id);
            setScreenForm({ screenId: "", name: "", rows: 0, cols: 0 });
        } catch (err) {
            alert("Failed to update Screen!");
        }
    };

    const handleRemoveScreen = async (screenId) => {
        try {
            await removeScreen(selectedTheatre._id, screenId);
            alert("Screen removed succefully!");
            await handleSelectTheatre(selectedTheatre._id);
        } catch (err) {
            alert("Failed to remove screen!");
        }
    };

    if (loading) return <p>Loading theatres...</p>;
    if (error) return <p>Error loading theatres.</p>;

    return (
        <div className="theatre-manager">
            <h2 className="title">Theatre Manager</h2>

            {(isManager || isAdmin) && (
                <div className="card">
                    <h3>Create a Theatre</h3>
                    <div className="form-group">
                        <input className="input" placeholder="Name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input" placeholder="Address" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" onClick={(handleCreateTheatre)}>Create</button>
                </div>
            )}

            <h3>All Theatres</h3>
            <ul className="list">
                {theatres.map((t) => (
                    <li key={t._id} className="list-item">
                        <button className="btn-link" onClick={() => handleSelectTheatre(t._id)}>{t.name}</button>
                        {isAdmin && (
                            <button className="btn btn-danger" onClick={() => handleDeleteTheatre(t._id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>

            {selectedTheatre && (
                <div className="card">
                    <h3>Edit Theatre</h3>
                    <div className="form-group">
                        <input className="input" placeholder="Name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input" placeholder="Address" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <button className="btn btn-success" onClick={handleUpdateTheatre}>Update</button>

                    <h4>Screens</h4>
                    <ul className="list">
                        {selectedTheatre.screens.map((s) => (
                            <li key={s.screenId} className="list-item">
                                {s.name} ({s.layout.rows} X {s.layout.cols})
                                {isManager || isAdmin && (
                                    <>
                                        <button className="btn btn-warning" onClick={() => handleUpdateScreen(s.screenId)}>Update Screen</button>
                                        {isAdmin && (
                                            <button className="btn btn-danger" onClick={() => handleRemoveScreen(s.screenId)}>Remove Screen</button>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {(isManager || isAdmin) && (
                        <div className="form-group">
                            <h4>Add New Screen</h4>
                            <input className="input" placeholder="Screen ID" value={screenForm.screenId}
                                onChange={(e) => setScreenForm({ ...screenForm, screenId: e.target.value })} />
                            <input className="input" placeholder="Name" value={screenForm.name}
                                onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} />
                            <input className="input" type="Number" placeholder="Rows" value={screenForm.rows}
                                onChange={(e) => setScreenForm({ ...screenForm, rows: e.target.value })} />
                            <input className="input" type="Number" placeholder="Columns" value={screenForm.cols}
                                onChange={(e) => setScreenForm({ ...screenForm, cols: e.target.value })} />
                            <button className="btn btn-primary" onClick={handleAddScreen}>Add Screen</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}