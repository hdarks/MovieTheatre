import "./Card.css";

export default function Card({ image, title, subtitle, onClick }) {
    return (
        <div className="card" onClick={onClick}>
            <img src={image} alt={title} />
            <div className="card-content">
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    );
}