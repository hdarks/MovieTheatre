import "./ProgressBar.css";

export default function ProgressBar({ value, max }) {
    const percentage = Math.round((value / max) * 100);

    let fillClass = "";
    if (percentage < 30) fillClass = "low";
    if (percentage < 15) fillClass = "critical";

    return (
        <div className="progress-bar">
            <div className={`progress-fill ${fillClass}`} style={{ width: `${percentage}%` }}>
                {percentage}%
            </div>
        </div>
    );
}