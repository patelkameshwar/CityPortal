const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Tourism = require('../models/Tourism');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getAdminStats = async (req, res) => {
  try {
    const stats = {
      totalClients: await User.countDocuments({ role: 'client' }),
      totalHotels: await Hotel.countDocuments(),
      totalTourism: await Tourism.countDocuments(),
      totalEvents: await Event.countDocuments(),
      totalBookings: await Booking.countDocuments(),
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

