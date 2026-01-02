const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/tourism", require("./routes/tourismRoutes"));



app.get("/", (req, res) => {
  res.send("City Portal API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
