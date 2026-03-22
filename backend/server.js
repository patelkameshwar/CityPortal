const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

// Register models
require("./models/User");
require("./models/Hotel");
require("./models/Event");
require("./models/Tourism");
require("./models/Booking");
require("./models/Blog");

const cookieParser = require('cookie-parser');
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/tourism", require("./routes/tourismRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/clients", require("./routes/clientRoutes"));
app.use("/api/client", require("./routes/clientRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));


app.get("/", (req, res) => {
  res.send("City Portal API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
