import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";
import "./Chart.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function Chart({ labels, data, label }) {
    const chartData = {
        labels,
        datasets: [{
            label,
            data,
            borderColor: "rgba(99,102,241,1)",
            backgroundColor: "rgba(99,102,241,0.2)",
            tension: 0.4,
            pointBackgroundColor: "#6366f1",
            pointBorderColor: "#fff",
            pointHoverRadius: 6,
            pointRadius: 4
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: label,
                font: { size: 18, weight: "bold" },
                color: "#1f2937",
            },
            legend: {
                display: true,
                position: "bottom",
                labels: { color: "374151", font: { size: 12 } }
            },
            tooltip: {
                backgroundColor: "#111827",
                titleColor: "#fff",
                bodyColor: "#f9fafb",
                cornerRadius: 6,
                padding: 10
            }
        },
        scales: {
            x: {
                grid: { color: "rgba(209,213,219, 0.3)" },
                ticks: { color: "#374151", font: { size: 12 } }
            },
            y: {
                grid: { color: "rgba(209,213,219,0.3)" },
                ticks: { color: "#374151", font: { size: 12 } }
            }
        }
    };

    return (
        <div className="chart-container">
            <Line data={chartData} options={chartOptions} />;
        </div>
    );
}