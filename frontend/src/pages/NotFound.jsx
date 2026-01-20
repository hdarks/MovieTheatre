import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="notfound-page" style={styles.container}>
            <h1 style={styles.code}>404</h1>
            <h2 style={styles.title}>Page Not Found</h2>
            <p style={styles.text}>
                Looks like this page wandered off the screen.
                Let's get you back to safety.
            </p>

            <Link to="/" style={styles.button}>
                Go Home</Link>
        </div>
    );
}

const styles = {
    container: {
        textAlign: "center",
        padding: "80px 20px"
    },
    code: {
        fontSize: "6rem",
        margin: 0,
        color: "#ff6b6b"
    },
    title: {
        fontSize: "2rem",
        marginTop: "10px"
    },
    text: {
        marginTop: "10px",
        fontSize: "1.1rem",
        opacity: 0.8
    },
    button: {
        marginTop: "20px",
        display: "inline-block",
        padding: "10px 20px",
        background: "#007bff",
        color: "#fff",
        borderRadius: "6px",
        textDecoration: "none"
    }
};