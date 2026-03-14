const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');


exports.getClientHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id })
.populate('bookings', 'status totalPrice createdAt bookingToDate')
      .sort({ createdAt: -1 });
    
    // Add bookings count
    const hotelsWithCount = hotels.map(hotel => ({
      ...hotel._doc,
      bookingsCount: hotel.bookings ? hotel.bookings.filter(b => b.status === 'Confirmed' && new Date(b.bookingToDate) >= new Date()).length : 0
    })); 

    res.json({ success: true, hotels: hotelsWithCount });
  } catch (error) {
    console.error('Get Client Hotels Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [hotelsCount, eventsCount, bookingsCountResult, revenueResult] = await Promise.all([
      Hotel.countDocuments({ owner: req.user.id }),
      Event.countDocuments({ owner: req.user.id }),
      Booking.countDocuments({ 
        'itemId.owner': req.user.id, 
        status: 'Confirmed',
        bookingToDate: { $gte: new Date() }
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


