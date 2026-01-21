import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch.js";
import { getTheatres, getScreenLayout, updateScreenLayout } from "@/api/theatreApi.js";
import { generateSeatGrid } from "@/utils/seatGenerator.js";
import "@/styles/variables.css";
import "@/styles/seatMap.css";
import "./AdminSeatEditor.css";

export default function AdminSeatEditor({ theatreId, screenId }) {
    const { data: theatres, loading: loadingTheatres, error: errorTheatres } = useFetch(getTheatres, [], []);
    const [selectedTheatre, setSelectedTheatre] = useState("");
    const [selectedScreen, setSelectedScreen] = useState("");
    const [layout, setLayout] = useState(null);

    const { data, loading, error } = useFetch(
        selectedTheatre && selectedScreen
            ? () => getScreenLayout(selectedTheatre, selectedScreen)
            : null,
        null,
        [selectedTheatre, selectedScreen]
    );

    useEffect(() => {
        if (data) {
            setLayout(data);
        }
    }, [data]);

    if (loadingTheatres) return <p>Loading theatres...</p>;
    if (errorTheatres) return <p>Error loading theatres.</p>;
    if (!theatres.length) return <p>No Layout Found.</p>;

    const updateSeatType = (row, col, type) => {
        setLayout((prev) => ({
            ...prev,
            seats: prev.seats.map((s) => s.row === row && s.col === col ? { ...s, type } : s)
        }));
    };

    const saveLayout = async () => {
        try {
            await updateScreenLayout(selectedTheatre, selectedScreen, layout);
            alert("Layout updated successfully");
        } catch (err) {
            console.error("Failed to save layout.", err);
            alert("Error saving layout");
        }
    };

    const seatRows = [];
    if (layout) {
        for (let r = 0; r < layout.rows; r++) {
            const rowLetter = String.fromCharCode(65 + r);
            const rowSeats = layout.seats.filter((s) => s.row === rowLetter);
            seatRows.push({ rowLabel: rowLetter, seats: rowSeats });
        }
    }

    return (
        <div>
            <h2>Select Theatre and Screen</h2>

            <label>
                Theatre:
                <select value={selectedTheatre} onChange={(e) => {
                    setSelectedTheatre(e.target.value);
                    setSelectedScreen("");
                    setLayout(null);
                }}>
                    <option value="">-- Select Theatre --</option>
                    {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </label>

            {selectedTheatre && (
                <label>
                    Screen:
                    <select value={selectedScreen} onChange={(e) => {
                        setSelectedScreen(e.target.value);
                        setLayout(null);
                    }}>
                        <option value="">-- Select Screen --</option>
                        {theatres.find((t) => t._id === selectedTheatre)
                            ?.screens.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name}
                                </option>
                            ))}
                    </select>
                </label>
            )}

            {loading && <p>Loading layout...</p>}
            {error && <p>Error loading layout.</p>}
            {layout && (
                <div className="seatmap-container">
                    <div className="seat-legend">
                        <span><span className="legend-box standard"></span> Standard</span>
                        <span><span className="legend-box vip"></span> VIP</span>
                        <span><span className="legend-box accessible"></span> Accessible</span>
                    </div>

                    <div className="bulk-editor">
                        <label>
                            Change Seat Type for a Row:
                            <select onChange={(e) => {
                                const [rowLabel, type] = e.target.value.split(":");
                                setLayout((prev) => ({
                                    ...prev,
                                    seats: prev.seats.map((s) => s.row === rowLabel ? { ...s, type } : s)
                                }));
                            }}>
                                <option value="">-- Select Row & Type --</option>
                                {Array.from({ length: layout.rows }, (_, i) => {
                                    const rowLabel = String.fromCharCode(65 + i);
                                    return ["standard", "vip", "accessible"].map((type) => (
                                        <option key={`${rowLabel}:${type}`} value={`${rowLabel}:${type}`}>
                                            Row {rowLabel} → {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))
                                })}
                            </select>
                        </label>
                    </div>

                    <label>
                        Change Seat Types for Multiple Rows:
                        <select onChange={(e) => {
                            const [rows, type] = e.target.value.split(":");
                            const rowLabels = rows.split(",");
                            setLayout((prev) => ({
                                ...prev,
                                seats: prev.seats.map((s) => rowLabels.includes(s.row) ? { ...s, type } : s)
                            }));
                        }}>
                            <option value="">-- Select Rows & Type --</option>
                            {Array.from({ length: layout.rows }, (_, i) => String.fromCharCode(65 + i))
                                .map((rowLabel) => rowLabel)
                                .reduce((options, rowLabel, i, arr) => {
                                    if (i % 3 === 0) {
                                        const group = arr.slice(i, i + 3).join(",");
                                        ["standard", "vip", "accessible"].forEach((type) => {
                                            options.push(
                                                <option key={`${group}:${type}`} value={`${group}:${type}`}>
                                                    Rows {group} → {type}
                                                </option>
                                            );
                                        });
                                    }
                                    return options;
                                }, [])}
                        </select>
                    </label>
                    {layout.seats.length === 0 && (
                        <div style={{ textAlign: "center", marginBottom: "10px" }}>
                            <button onClick={() => {
                                const defaultSeats = generateSeatGrid(layout.rows, layout.cols);
                                setLayout((prev) => ({ ...prev, seats: defaultSeats }));
                                alert(`Generated ${layout.rows}×${layout.cols} seat grid`);
                            }} className="btn-secondary">Generate Default Layout</button>
                        </div>
                    )}
                    <div className="screen">SCREEN</div>
                    {seatRows.map(({ rowLabel, seats }) => (
                        <div className="seat-row" key={rowLabel}>
                            <span className="row-label">{rowLabel}</span>
                            {seats.map((seat) => (
                                <button key={`${seat.row}${seat.col}`}
                                    className={`seat ${seat.type}`}
                                    onClick={() => {
                                        const nextType = seat.type === "standard"
                                            ? "vip" : seat.type === "vip"
                                                ? "accessible"
                                                : "standard"
                                        updateSeatType(seat.row, seat.col, nextType);
                                    }}>{seat.row}{seat.col}</button>
                            ))}
                        </div>
                    ))}
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <button onClick={saveLayout} className="btn-primary">Save Layout</button>
                    </div>
                </div>
            )}
        </div>
    );
}