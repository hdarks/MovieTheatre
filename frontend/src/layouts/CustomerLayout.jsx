import { Outlet } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./CustomerLayout.css";

export default function CustomerLayout() {
    const { theme } = useTheme();

    return (
        <div className={`app-layout ${theme}`}>
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