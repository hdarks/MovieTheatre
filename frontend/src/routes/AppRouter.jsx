import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";

import CustomerLayout from "@/layouts/CustomerLayout";
import StaffLayout from "@/layouts/StaffLayout";
import ManagerLayout from "@/layouts/ManagerLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Browse from "@/pages/customer/Browse";
import ShowtimeSelector from "@/pages/customer/ShowtimeSelector";
import SeatSelection from "@/pages/customer/SeatSelection";
import Checkout from "@/pages/customer/Checkout";
import Tickets from "@/pages/customer/Tickets";
import MyBookings from "@/pages/customer/MyBookings";

import Scanner from "@/pages/staff/Scanner";
import SeatOverview from "@/pages/staff/SeatOverview";
import Concessions from "@/pages/staff/Concessions";
import CreateBooking from "@/pages/staff/CreateBooking";

import Scheduler from "@/pages/manager/Scheduler";
import PricingRules from "@/pages/manager/PricingRules";
import Analytics from "@/pages/manager/Analytics";
import Refunds from "@/pages/manager/Refunds";
import MovieManager from "@/pages/manager/MovieManager";
import TheatreManager from "@/pages/manager/TheatreManager";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManager from "@/pages/admin/UserManager";
import MovieManagerAdmin from "@/pages/admin/MovieManagerAdmin";
import TheatreManagerAdmin from "@/pages/admin/TheatreManagerAdmin";
import PricingRulesAdmin from "@/pages/admin/PricingRulesAdmin";
import SystemAnalytics from "@/pages/admin/SystemAnalytics";
import ConcessionsAdmin from "@/pages/admin/ConcessionsAdmin";
import BookingOverview from "@/pages/admin/BookingOverview";
import AdminSeatEditor from "@/pages/admin/AdminSeatEditor";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import NotFound from "@/pages/NotFound";

export default function AppRouter() {
    const { user, loading } = useAuth();
    const { isCustomer, isStaff, isManager, isAdmin } = useRole();

    if (loading) return <p>Loading...</p>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {isCustomer && (
                    <Route path="/" element={<CustomerLayout />}>
                        <Route index element={<Browse />} />
                        <Route path="showtimes" element={<ShowtimeSelector />} />
                        <Route path="seats/:showtimeId" element={<SeatSelection />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="tickets" element={<Tickets />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                    </Route>
                )}

                {isStaff && (
                    <Route path="/staff" element={<StaffLayout />}>
                        <Route index element={<Scanner />} />
                        <Route path="seats" element={<SeatOverview />} />
                        <Route path="concessions" element={<Concessions />} />
                        <Route path="book" element={<CreateBooking />} />
                    </Route>
                )}

                {isManager && (
                    <Route path="/manager" element={<ManagerLayout />}>
                        <Route index element={<Scheduler />} />
                        <Route path="pricing" element={<PricingRules />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="refunds" element={<Refunds />} />
                        <Route path="movies" element={<MovieManager />} />
                        <Route path="theatres" element={<TheatreManager />} />
                    </Route>
                )}

                {isAdmin && (
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<UserManager />} />
                        <Route path="movies" element={<MovieManagerAdmin />} />
                        <Route path="theatres" element={<TheatreManagerAdmin />} />
                        <Route path="pricings" element={<PricingRulesAdmin />} />
                        <Route path="analytics" element={<SystemAnalytics />} />
                        <Route path="concessions" element={<ConcessionsAdmin />} />
                        <Route path="bookings" element={<BookingOverview />} />
                        <Route path="seats" element={<AdminSeatEditor />} />
                    </Route>
                )}

                {/* Redirect unauthenticated users */}
                {!user && <Route path="*" element={<Navigate to="/login" replace />} />}

                {/* Fall Back */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};