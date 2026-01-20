import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./ManagerLayout.css";

export default function ManagerLayout() {
    return (
        <div className="manager-layout">
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