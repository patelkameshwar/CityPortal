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

exports.getRecentClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate('owner', 'name')
      .select('name location pricePerNight images createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('owner', 'name')
      .select('title location createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentTourism = async (req, res) => {
  try {
    const tourism = await Tourism.find()
      .populate('owner', 'name')
      .select('name location createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, tourism });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

