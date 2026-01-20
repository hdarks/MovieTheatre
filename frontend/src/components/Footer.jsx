import "./Footer.css";
import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
    const { theme } = useTheme();
    return (
        <footer className={`footer ${theme}`}>
            <p>© {new Date().getFullYear()} Movie Theatre Management | Built with MERN + Vite</p>
        </footer>
    );
}