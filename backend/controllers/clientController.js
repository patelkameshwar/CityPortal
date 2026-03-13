const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');


exports.getClientStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [hotelsCount, eventsCount, bookingsCountResult, revenueResult] = await Promise.all([
      Hotel.countDocuments({ owner: req.user.id }),
      Event.countDocuments({ owner: req.user.id }),
      Booking.countDocuments({ 
        'itemId.owner': req.user.id, 
        status: 'Confirmed'
      }),
      Booking.aggregate([
        {
          $match: {
            'itemId.owner': new mongoose.Types.ObjectId(req.user.id),
            status: 'Confirmed',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    const stats = {
      hotels: hotelsCount,
      bookings: bookingsCountResult,
      events: eventsCount,
      revenue: revenueResult[0]?.totalRevenue || 0
    };
    
    res.json({ success: true, data: stats });
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


