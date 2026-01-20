import { useFetch } from "@/hooks/useFetch.js";
import { getSystemAnalytics } from "@/api/analyticsApi.js";
import Chart from "@/components/Chart";
import ProgressBar from "@/components/ProgressBar";
import "./SystemAnalytics.css";
import { useState } from "react";

export default function SystemAnalytics() {
    const { data: analytics, loading, error } = useFetch(getSystemAnalytics, null, []);
    const [localAnalytics, setLocalAnalytics] = useState(null);

    if (analytics && !localAnalytics) {
        setLocalAnalytics(analytics);
    }

    const handleRefresh = async () => {
        try {
            const res = await getSystemAnalytics();
            setLocalAnalytics(res.data);
        } catch (err) {
            console.error("Failed to refresh analytics", err);
        }
    }

    if (loading) return <p>Loading analytics...</p>;
    if (error) return <p>Error loading analytics.</p>;

    return (
        <div className="analytics-page">
            <h2>📊 System Analytics (Admin)</h2>
            <button className="btn btn-primary" onClick={handleRefresh}>🔄 Refresh</button>

            <section>
                <h3>Overall Occupancy</h3>
                <ProgressBar value={localAnalytics.occupancy} max={100} />
            </section>

            <section>
                <h3>Revenue</h3>
                <Chart labels={localAnalytics.revenue.labels}
                    data={localAnalytics.revenue.values}
                    label="Revenue"
                />
            </section>

            <section>
                <h3>User Statistics</h3>
                <ul>
                    <li><strong>Total Users:</strong> {localAnalytics.users.total}</li>
                    <li><strong>Admins:</strong> {localAnalytics.users.admins}</li>
                    <li><strong>Managers:</strong> {localAnalytics.users.managers}</li>
                    <li><strong>Staff:</strong> {localAnalytics.users.staff}</li>
                    <li><strong>Customers:</strong> {localAnalytics.users.customers}</li>
                </ul>
            </section>

            <section>
                <h3>Theatre Statistics</h3>
                <ul>
                    <li><strong>Total Theatres:</strong> {localAnalytics.theatres.total}</li>
                    <li><strong>Total Screens:</strong> {localAnalytics.screens.total}</li>
                </ul>
            </section>

            <section>
                <h3>Top Movies</h3>
                <ul>
                    {localAnalytics.topMovies.map((m) => (
                        <li key={m.title}>
                            <strong>{m.title}</strong> - {m.ticketsSold} tickets
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}