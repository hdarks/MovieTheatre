import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const registerUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (req.user.role === "customer") {
            if (role === "staff" || role === "manager") {
                return res.status(403).json({ error: "Customers cannot register staff or managers" });
            }
            if (role !== "customer") {
                return res.status(403).json({ error: "Customer can only register themselves as customer." });
            }
        }

        const exisiting = await User.findOne({ email });
        if (exisiting) {
            return res.status(400).json({ error: "Email already Registered" });
        }

        const salt = await bcrypt.genSalt(11);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({ email, passwordHash, name, role });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not Found" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash");
        if (!user) return res.status(404).json({ error: "User not Found" });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const { genres, language } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.preferences.genres = genres || user.preferences.genres;
        user.preferences.language = language || user.language.language;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addLoyaltyPoints = async (req, res) => {
    try {
        const { points } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.loyaltyPoints += points;
        await user.save();
        res.json({ loyaltyPoints: user.loyaltyPoints });
    } catch (err) {
        res.status(500).json({ error: Error.message });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.findByRole(role).select("-passwordHash");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: Error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        await user.deleteOne();
        res.json({ message: "User Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}