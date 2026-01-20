import { useState } from "react";
import { getPricingRules, updatePricingRule, addPricingRule, deletePricingRule } from "@/api/pricingApi.js";
import { getShowtimes } from "@/api/showtimeApi.js";
import { useFetch } from "@/hooks/useFetch.js";
import "./PricingRulesAdmin.css";

export default function PricingRulesAdmin() {
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [message, setMessage] = useState(null);
    const [newRule, setNewRule] = useState({ type: "timeBased", value: 0, op: "add" });

    const { data: showtimes, loading: loadingShowtimes, error: showtimeError } = useFetch(getShowtimes, null, []);
    const { data: rules, loading: loadingRules, error: rulesError } = useFetch(
        selectedShowtime ? getPricingRules : () => Promise.resolve({ data: [] }),
        selectedShowtime,
        [selectedShowtime]
    );

    const handleUpdate = async (ruleId, field, value) => {
        try {
            await updatePricingRule(selectedShowtime, ruleId, { [field]: value });
            setMessage("✅ Pricing rule updated");
            const idx = rules.findIndex((r) => r.ruleId === ruleId);
            if (idx !== -1) rules[idx] = { ...rules[idx], [field]: value };
        } catch (err) {
            setMessage("❌ Failed to update pricing rule");
        }
    };

    const handleDelete = async (ruleId) => {
        try {
            await deletePricingRule(selectedShowtime, ruleId);
            setMessage("Rule deleted");
            const idx = rules.findIndex((r) => r.ruleId === ruleId);
            if (idx !== -1) rules.splice(idx, 1);
        } catch (err) {
            setMessage("Failed to delete rule");
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
            const payload = { ruleId: crypto.randomUUID(), ...newRule };
            const res = await addPricingRule(selectedShowtime, payload);
            setMessage("Rule added!");
            setNewRule({ type: "timeBased", value: 0, op: "add" });
            rules.push(res.data || payload);
        } catch (err) {
            setMessage("Error adding rule");
        }
    };

    if (loadingShowtimes) return <p>loading showtimes...</p>;
    if (showtimeError) return <p>Error loading showtimes.</p>;

    return (
        <div className="pricing-page">
            <h2>💰 Pricing Rules Management (Admin)</h2>
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
                    {loadingRules && <p>Loading rules...</p>}
                    {rulesError && <p>Error loading rules.</p>}

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
                            <option vlaue="mul">Multiply</option>
                        </select>
                        <button onClick={handleAdd}>Save Rule</button>
                    </div>

                    <ul className="rules-list">
                        {rules?.map((rule) => (
                            <li key={rule.ruleId} className="rule-item">
                                <strong>{rule.type}</strong>
                                <input type="number" value={rule.value}
                                    onChange={(e) => handleUpdate(rule.ruleId, "value", Number(e.target.value))} />
                                <select value={rule.op} onChange={(e) => handleUpdate(rule.ruleId, "op", e.target.value)}>
                                    <option value="add">Add</option>
                                    <option value="mul">Multiply</option>
                                </select>
                                <button className="btn btn-danger" onClick={() => handleDelete(rule.ruleId)}>Delete</button>
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