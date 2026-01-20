import { useState } from "react";
import { getPricingRules, updatePricingRule, addPricingRule, deletePricingRule } from "@/api/pricingApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import { getShowtimes } from "@/api/showtimeApi.js";
import "./PricingRules.css";

export default function PricingRules() {
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [message, setMessage] = useState(null);
    const [newRule, setNewRule] = useState({ type: "timeBased", value: 0, op: "add" });

    const { data: showtimes, loading: loadingShowtimes, error: showtimeError } = useFetch(getShowtimes, null, []);

    const { data: rules, loading: loadingRules, error } = useFetch(
        selectedShowtime ? getPricingRules : () => Promise.resolve({ data: [] }),
        selectedShowtime,
        [selectedShowtime]
    );

    const handleUpdate = async (ruleId, field, value) => {
        try {
            await updatePricingRule(selectedShowtime, ruleId, { [field]: value });
            setMessage("✅ Pricing rule updated!");
        } catch {
            setMessage("❌ Failed to update rule.");
        }
    };

    const handleDelete = async (ruleId) => {
        try {
            await deletePricingRule(selectedShowtime, ruleId);
            setMessage("Rule deleted");
        } catch (err) {
            setMessage("Error deleting rule.");
        }
    };

    const handleNewRuleChange = (field, value) => {
        setNewRule({ ...newRule, [field]: value });
    };

    const handleAdd = async () => {
        if (!selectedShowtime) {
            setMessage("Please select a showtime first.");
            return;
        }
        try {
            await addPricingRule(selectedShowtime, { ruleId: crypto.randomUUID(), ...newRule });
            setMessage("Rule added!");
            setNewRule({ type: "timeBased", value: 0, op: "add" });
        } catch (err) {
            setMessage("Error adding rule.");
        }
    };

    if (loadingShowtimes) return <p>Loading showtimes...</p>;
    if (showtimeError) return <p>Error loading showtimes</p>;

    return (
        <div className="pricing-page">
            <h2>💰 Manage Pricing Rules</h2>
            {message && <p>{message}</p>}

            <select value={selectedShowtime} onChange={(e) => setSelectedShowtime(e.target.value)}>
                <option value="">Select a Showtime</option>
                {showtimes?.map((s) => (
                    <option key={s._id} value={s._id}>
                        {s.movieId?.title} - {s.theatreId?.name} - {new Date(s.startTime).toLocaleString()}
                    </option>
                ))}
            </select>

            {selectedShowtime ? (
                <>
                    {loadingRules && <p>Loading pricing rules...</p>}
                    {error && <p>Error loading pricing rules</p>}

                    <div className="add-rule-form">
                        <h3>Add New Rule</h3>
                        <select value={newRule.type} onChange={(e) => handleNewRuleChange("type", e.target.value)}>
                            <option value="timeBased">Time Based</option>
                            <option value="seatType">Seat Type</option>
                            <option value="promo">Promo</option>
                        </select>
                        <input type="number" value={newRule.value} placeholder="Value"
                            onChange={(e) => handleNewRuleChange("value", Number(e.target.value))} />
                        <select value={newRule.op} onChange={(e) => handleNewRuleChange("op", e.target.value)}>
                            <option value="add">Add</option>
                            <option value="mul">Multiply</option>
                        </select>
                        <button onClick={handleAdd}>Save Rule</button>
                    </div>

                    <ul>
                        {rules?.map((rule) => (
                            <li key={rule.ruleId}>
                                <strong>{rule.type}</strong>
                                <input type="number" value={rule.value}
                                    onChange={(e) => handleUpdate(rule.ruleId, "value", Number(e.target.value))} />
                                <select value={rule.op} onChange={(e) => handleUpdate(rule.ruleId, "op", e.target.value)}>
                                    <option value="add">Add</option>
                                    <option value="mul">Multiply</option>
                                </select>
                                <button onClick={(e) => handleDelete(rule.ruleId)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>Please select a showtime to show pricing rules.</p>
            )}
        </div>
    );
}