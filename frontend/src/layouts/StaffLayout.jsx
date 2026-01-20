import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./StaffLayout.css";

export default function StaffLayout() {
    return (
        <div className="staff-layout">
            <header className="navbar">
                <Navbar />
            </header>

            <main>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}