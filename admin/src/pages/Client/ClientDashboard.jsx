import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import {
  FaUsers,
  FaHotel,
  FaCalendarAlt,
  FaDollarSign,
  FaGlassCheers,
  FaSignOutAlt,
  FaTheaterMasks,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ClientDashboard = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchStats();
    fetchRecentBookings();
  }, [isAuthenticated]);

  const [stats, setStats] = React.useState([
    {
      name: "Your Hotels",
      value: "0",
      renderIcon: () => <FaHotel />,
      color: "bg-emerald-500 ",
    },
    {
      name: "Active Bookings",
      value: "0",
      renderIcon: () => <FaCalendarAlt />,
      color: "bg-orange-500",
    },
    {
      name: "Events Hosted",
      value: "0",
      renderIcon: () => <FaGlassCheers />,
      color: "bg-purple-500",
    },
    {
      name: "Monthly Revenue",
      value: "₹0",
      renderIcon: () => <FaDollarSign />,
      color: "bg-blue-500",
    },
  ]);
  const [chartData, setChartData] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(true);
  const [currentPeriod, setCurrentPeriod] = React.useState("day");
  const [loading, setLoading] = React.useState(true);
  const [recentBookings, setRecentBookings] = React.useState([]);
  const [recentLoading, setRecentLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/client/stats");
      console.log("Client stats response:", response.data);
      if (response.data.success) {
        const statsData = response.data.data || response.data.stats || {};
        setStats([
          {
            name: "Your Hotels",
            value: statsData.hotels?.toLocaleString() || "0",
            renderIcon: () => <FaHotel />,
            color: "bg-emerald-500",
          },
          {
            name: "Active Bookings",
            value: statsData.bookings?.toLocaleString() || "0",
            renderIcon: () => <FaCalendarAlt />,
            color: "bg-orange-500",
          },
          {
            name: "Events Hosted",
            value: statsData.events?.toLocaleString() || "0",
            renderIcon: () => <FaTheaterMasks />,
            color: "bg-purple-500",
          },
          {
            name: "Monthly Revenue",
            value: `₹${statsData.revenue?.toLocaleString() || "0"}`,
            renderIcon: () => <FaDollarSign />,
            color: "bg-blue-500",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      setRecentLoading(true);
      const response = await api.get("/bookings/client");
      setRecentBookings(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent bookings:", error);
    } finally {
      setRecentLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setChartLoading(true);
        const response = await api.get(
          `/client/analytics?period=${currentPeriod}`,
        );
        console.log("Client analytics response:", response.data);
        if (response.data.success) {
          setChartData(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setChartLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentPeriod]);

  const { logout: contextLogout } = useAuth();
  const formatMonthYear = (value) => {
    let date;
    if (typeof value === "string") {
      if (value.includes("-")) {
        date = new Date(value.length === 10 ? value : value + "-01");
      } else if (/\d{4}/.test(value)) {
        date = new Date(value);
      } else {
        return value;
      }
    } else if (value instanceof Date) {
      date = value;
    }

    if (!date || isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "2-digit",
    }).format(date);
  };

  const formatBookingDate = (value) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDayMonth = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatRevenue = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + "M";
    }
    if (numValue >= 1000) {
      return Math.round(numValue / 1000) + "k";
    }
    return numValue.toLocaleString();
  };

  const [cancelLoading, setCancelLoading] = React.useState(null);

  const handleCancelBooking = async (bookingId) => {
    if (cancelLoading === bookingId) return;
    setCancelLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: "Cancelled" });
      setRecentBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "Cancelled" } : b,
        ),
      );
      await fetchStats();
      await fetchAnalytics(currentPeriod);
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(null);
    }
  };

  const fetchAnalytics = async (period) => {
    try {
      setChartLoading(true);
      const response = await api.get(`/client/analytics?period=${period}`);
      if (response.data.success) {
        setChartData(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setChartLoading(false);
    }
  };

  const handleLogout = () => {
    contextLogout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Client Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, Client! Manage your CityPortal services.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-semibold">
                Client Mode
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            return (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.renderIcon && stat.renderIcon()}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-bold text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bookings & Revenue
                  </h3>
                  <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    {["day", "month", "year"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setCurrentPeriod(period)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          currentPeriod === period
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {currentPeriod === "day"
                    ? "Last 30 days"
                    : currentPeriod === "month"
                      ? "Last 12 months"
                      : "Last 5 years"}
                </p>

                <div style={{ width: "100%", height: 350 }}>
                  {chartLoading ? (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Loading chart...</div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <FaChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No analytics data available</p>
                      </div>
                    </div>
                  ) : (
                    <div className=" py-6 bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm">
                      {/* Chart goes here */}
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 20 }}>
                          <defs>
                            <linearGradient
                              id="bookingFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0.02}
                              />
                            </linearGradient>

                            <linearGradient
                              id="revenueFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>

                          {/* Grid */}
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                            opacity={0.6}
                          />

                          {/* X Axis */}
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            dy={10}
                            tickFormatter={
                              currentPeriod === "day"
                                ? formatDayMonth
                                : formatMonthYear
                            }
                          />

                          {/* Y Axis */}
                          <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                          />

                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={formatRevenue}
                          />

                          {/* Tooltip (clean SaaS style) */}
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderRadius: "14px",
                              border: "1px solid #f1f5f9",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                              padding: "10px 14px",
                            }}
                            labelStyle={{ fontSize: 12, color: "#64748b" }}
                            itemStyle={{ fontSize: 14, fontWeight: 500 }}
                            cursor={{ stroke: "#cbd5f5", strokeWidth: 1 }}
                          />

                          {/* Legend (minimal) */}
                          <Legend
                            wrapperStyle={{
                              fontSize: "14px",
                              paddingTop: "10px",
                            }}
                          />

                          {/* 🔵 Area (Bookings) */}
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="activeBookings"
                            stroke="none"
                            fill="url(#bookingFill)"
                            tooltipType="none"
                            legendType="none"
                          />

                          {/* 🟢 Area (Revenue) */}
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stroke="none"
                            fill="url(#revenueFill)"
                            tooltipType="none"
                            legendType="none"
                          />

                          {/* 🔵 Line (Bookings) */}
                          <Line
                            yAxisId="left"
                            type="natural"
                            dataKey="activeBookings"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                            name="Bookings"
                            animationDuration={900}
                            style={{
                              filter:
                                "drop-shadow(0 4px 8px rgba(59,130,246,0.25))",
                            }}
                          />

                          {/* 🟢 Line (Revenue) */}
                          <Line
                            yAxisId="right"
                            type="natural"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                            name="Revenue (₹)"
                            animationDuration={900}
                            style={{
                              filter:
                                "drop-shadow(0 4px 8px rgba(16,185,129,0.25))",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/client/view-profile"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FaUsers className="h-5 w-5 text-blue-600 mr-3" />
                    View Profile
                  </Link>
                  <Link
                    to="/client/my-hotels"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FaHotel className="h-5 w-5 text-emerald-600 mr-3" />
                    My Hotels
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-3" />
                    Manage Bookings
                  </Link>
                  <Link
                    to="/client/my-events"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FaTheaterMasks className="h-5 w-5 text-purple-600 mr-3" />
                    My Events
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Bookings
                </h3>
                <Link
                  to="/my-bookings"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                >
                  View all →
                </Link>
              </div>
            </div>
            {recentLoading ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-12">
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent bookings</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Booking Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Qty/Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => {
                      const name =
                        booking.itemId?.name ||
                        booking.itemId?.title ||
                        "Unknown Item";
                      const Icon =
                        booking.itemType === "Hotel"
                          ? FaHotel
                          : booking.itemType === "Event"
                            ? FaTheaterMasks
                            : FaMapMarkedAlt;
                      const statusColor =
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800";
                      const itemDates =
                        booking.itemType === "Hotel"
                          ? `${formatDayMonth(booking.bookingFromDate)} - ${formatDayMonth(booking.bookingToDate)}`
                          : booking.itemType === "Event" ||
                              booking.itemType === "Tourism"
                            ? formatDayMonth(booking.bookingDate)
                            : "N/A";
                      const customerName = booking.user?.name || "Unknown";
                      const qtyText = `${booking.totalQuantity || 1} ${booking.itemType === "Hotel" ? "room(s)" : "ticket(s)"}`;
                      return (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.itemType}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {itemDates}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-900">
                              {qtyText}
                            </div>
                            <div className="font-medium text-orange-600">
                              ₹{booking.totalPrice?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.status === "Confirmed" ? (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={cancelLoading === booking._id}
                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded-2xl border border-red-200 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancelLoading === booking._id
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs">
                                Cancelled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
