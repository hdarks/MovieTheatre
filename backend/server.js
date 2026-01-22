import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import { Server } from "socket.io";
import http from "http";

import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theatreRoutes from "./routes/theatreRoutes.js";
import showtimeRoutes from "./routes/showtimeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import concessionRoutes from "./routes/concessionRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/concessions", concessionRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/showtimes", pricingRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

const showtimeNamespace = io.of("/showtimes");

showtimeNamespace.on("connection", (socket) => {
    console.log("Client connected to /showtimes: ", socket.id);

    socket.on("joinShowtime", ({ showtimeId }) => {
        socket.join(showtimeId);
        console.log(`Socket ${socket.id} joined showtime ${showtimeId}`);
    });

    socket.on("lockSeat", ({ showtimeId, seatKey }) => {
        socket.to(showtimeId).emit("seatLocked", seatKey);
    });

    socket.on("unlockSeat", ({ showtimeId, seatKey }) => {
        socket.to(showtimeId).emit("seatUnlocked", seatKey);
    });

    socket.on("seatBooked", ({ showtimeId, seatKey }) => {
        console.log(`Seat Booked: ${seatKey} in showtime ${showtimeId}`);
        showtimeNamespace.to(showtimeId).emit("seatBooked", seatKey);
    });

    socket.on("seatCancelled", ({ showtimeId, seatKey }) => {
        console.log(`Seat cancelled: ${seatKey} in showtime ${showtimeId}`);
        showtimeNamespace.to(showtimeId).emit("seatCancelled", seatKey);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`);
});

export { io };