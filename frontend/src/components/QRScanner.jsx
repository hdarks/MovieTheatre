import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./QRScanner.css";

export default function QRScanner({ onScan }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
        scanner.render(
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                console.error("QR Scan Error", errorMessage);
            }
        );

        return () => {
            scanner.clear().catch((err) => console.error("Cleanup error:", err));
        }
    }, [onScan]);

    return <div id="qr-reader" style={{ width: "100%" }}></div>;
}