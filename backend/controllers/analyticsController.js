import Booking from "../model/Booking.js";
import Showtime from "../model/Showtime.js";
import Movie from "../model/Movie.js";
import User from "../model/User.js";

export const getAnalytics = async (req, res) => {
    try {
        const totalSeats = await Showtime.aggregate([
            { $group: { _id: null, total: { $sum: { $size: "lockedSeats" } } } }
        ]);
        const bookedSeats = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: { $size: "seats" } } } }
        ]);
        const occupancy = totalSeats.length && bookedSeats.length
            ? Math.round((bookedSeats[0].total / totalSeats[0].total) * 100)
            : 0;

        const revenue = await Booking.aggregate([
            { $match: { status: "confirmed" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        const revenueLabels = revenue.map((r) => `Month ${r._id}`);
        const revenueValues = revenue.map((r) => r.total);

        const topMovies = await Booking.aggregate([
            { $match: { Status: "confirmed" } },
            { $group: { _id: "movieId", ticketsSold: { $sum: { $size: "$seats" } } } },
            { $sort: { ticketSold: -1 } },
            { $limit: 5 }
        ]);

        const populatedMovies = await Movie.find({
            _id: { $in: topMovies.map((m) => m._id) }
        }).select("title");

        const topMoviesWithTitles = topMovies.map((m) => {
            const movie = populatedMovies.find((mv) => mv._id.equals(m._id));
            return { title: movie?.title || "Unknown", ticketSold: m.ticketSold };
        });

        res.json({
            occupancy,
            revenue: { labels: revenueLabels, values: revenueValues },
            topMovies: topMoviesWithTitles
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSystemAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: "admin" });
        const managers = await User.countDocuments({ role: "manager" });
        const staff = await User.countDocuments({ role: "staff" });
        const customers = await User.countDocuments({ role: "customer" });

        const totalTheatres = await Theatre.countDocuments();
        const totalScreens = (await Theatre.aggregate([
            { $project: { screenCount: { $size: "$screens" } } },
            { $group: { _id: null, screens: { $sum: "$screenCount" } } }
        ]))[0]?.screens || 0;

        const totalSeats = await Theatre.aggregate([
            { $unwind: "$screens" },
            { $group: { _id: null, total: { $sum: { $multiply: ["$screens.layout.rows", "$screens.layout.cols"] } } } }
        ]);

        const bookedSeats = await Showtime.aggregate([
            { $group: { _id: null, total: { $sum: "$ticketsSold" } } }
        ]);

        const occupancy = totalSeats.length && bookedSeats.length
            ? Math.round((bookedSeats[0].total / totalSeats[0].total) * 100)
            : 0;

        const topMovies = await Showtime.aggregate([
            { $group: { _id: "$movieId", ticketsSold: { $sum: "$ticketsSold" } } },
            { $sort: { ticketsSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: "$movie" },
            { $project: { title: "$movie.title", ticketsSold: 1 } }
        ]);

        const revenue = await Showtime.aggregate([
            {
                $group: {
                    _id: { $month: "$startTime" },
                    total: { $sum: "$revenue" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            occupancy,
            revenue: {
                labels: revenue.map((r) => `Month ${r._id}`),
                values: revenue.map((r) => r.total)
            },
            users: { total: totalUsers, admins, managers, staff, customers },
            theatres: { total: totalTheatres, screens: totalScreens },
            topMovies
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch system analytics", error: err.message });
    }
}