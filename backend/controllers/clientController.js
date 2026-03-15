const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');


exports.getClientEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id })
      .populate('bookings', 'status totalPrice createdAt bookingDate bookingToDate bookedAt seats')
      .sort({ createdAt: -1 });
    
    const eventsWithCount = events.map(event => ({
      ...event._doc,
      bookingsCount: event.bookings ? event.bookings.length : 0
    })); 

    res.json({ success: true, events: eventsWithCount });
  } catch (error) {
    console.error('Get Client Events Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    
    // Hotel & Event counts
    const hotelsCount = await Hotel.countDocuments({ owner: req.user.id });
    const eventsCount = await Event.countDocuments({ owner: req.user.id });

    // Active Bookings: Hotel Booking docs + Event embedded bookings (future dates)
    const bookingCountHotel = await Booking.countDocuments({ 
      'itemId.owner': req.user.id, 
      status: 'Confirmed',
      bookingToDate: { $gte: new Date(Date.now() - 24*60*60*1000) } // bookings ending from last 24h
    });

    const events = await Event.find({ owner: req.user.id });
    const bookingCountEvent = events.reduce((sum, event) => {
      return sum + event.bookings.filter(b => new Date(b.bookingDate) > new Date(Date.now() - 24*60*60*1000)).length; // bookings from last 24h considered active if future
    }, 0);


    // Revenue: Hotel Booking + Event (price * seats for recent bookings)
    const revenueHotel = await Booking.aggregate([
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
    ]);
    const revenueEvent = events.reduce((sum, event) => {
      return sum + event.bookings.filter(b => b.bookedAt >= startOfMonth).reduce((total, b) => total + (event.price * b.seats || 0), 0);
    }, 0);

    const stats = {
      hotels: hotelsCount,
      bookings: bookingCountHotel + bookingCountEvent,
      events: eventsCount,
      revenue: (revenueHotel[0]?.totalRevenue || 0) + revenueEvent
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


