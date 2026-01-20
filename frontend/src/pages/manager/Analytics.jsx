import { useFetch } from "@/hooks/useFetch.js";
import { getAnalytics } from "@/api/analyticsApi.js";
import Chart from "@/components/Chart";
import ProgressBar from "@/components/ProgressBar";
import "./Analytics.css";

export default function Analytics() {
    const { data: analytics, loading, error } = useFetch(getAnalytics, null, []);

    if (loading) return <p>Loading analytics...</p>;
    if (error) return <p>Error loading analytics</p>;

    return (
        <div className="analytics-page">
            <h2>📊 Theatre Analytics</h2>

            <section>
                <h3>Occupancy Rate</h3>
                <ProgressBar value={analytics.occupancy} max={100} />
            </section>

            <section>
                <h3>Revenue Trends</h3>
                <Chart
                    labels={analytics.revenue.labels}
                    data={analytics.revenue.values}
                    label="Revenue"
                />
            </section>

            <section>
                <h3>Top Movies</h3>
                <ul>
                    {analytics.topMovies.map((m) => (
                        <li key={m.title}>
                            <strong>{m.title}</strong> — {m.ticketsSold} tickets
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}