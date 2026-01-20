import QRScanner from "@/components/QRScanner";
import { validateTicketQR, confirmBooking } from "@/api/bookingApi.js";
import { useState } from "react";
import "./Scanner.css";

export default function Scanner() {
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState("");

    const handleScan = async (qrCode) => {
        setMessage("");
        try {
            const res = await validateTicketQR(qrCode);
            setResult(res.data);
        } catch (err) {
            setResult({ error: "Invalid or Expired ticket" });
        }
    };

    const handleConfirm = async () => {
        try {
            await confirmBooking(result.bookingId);
            setMessage("Ticket confirmed successfully");
            setResult((prev) => ({ ...prev, status: "confirmed" }));
        } catch (err) {
            setMessage("Failed to confirm Ticket");
        }
    };

    return (
        <div className="scanner-page">
            <h2>Ticket Scanner</h2>
            <QRScanner onScan={handleScan} />
            {message && <p className="status-message">{message}</p>}
            {result && (
                <div className="scan-result">
                    {result.error ? (
                        <p className="error">{result.error}</p>
                    ) : (
                        <>
                            <p>Movie: {result.movieTitle}</p>
                            <p>Showtime: {new Date(result.showtime.startTime).toLocaleString()}</p>
                            <p>Seats: {result.seats.join(", ")}</p>
                            <p>Status: {result.status}</p>

                            {result.status === "pending" && (
                                <button onClick={handleConfirm}>Confirm Entry</button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}