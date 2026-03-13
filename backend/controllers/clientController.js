const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');


exports.getClientStats = async (req, res) => {
  try {
    const stats = {
      hotels: await Hotel.countDocuments({ owner: req.user.id }),
      bookings: await Booking.countDocuments({ 'itemId.owner': req.user.id }),
      events: await Event.countDocuments({ owner: req.user.id }),
      revenue: 12500, // TODO: calculate from bookings
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


