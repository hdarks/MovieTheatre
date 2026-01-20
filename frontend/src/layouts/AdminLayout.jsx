import { Outlet } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function AdminLayout() {
    const { theme } = useTheme();
    return (
        <div className={`admin-layout ${theme}`}>
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