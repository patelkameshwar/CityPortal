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

    // Get client's hotel and event IDs
    const clientHotels = await Hotel.find({ owner: req.user.id }).select('_id');
    const clientEvents = await Event.find({ owner: req.user.id }).select('_id');
    const hotelIds = clientHotels.map(h => h._id);
    const eventIds = clientEvents.map(e => e._id);

    const hotelsCount = hotelIds.length;
    const eventsCount = eventIds.length;

    // Active Bookings: Confirmed + future/non-past
    // Hotels: Bookings where itemType='Hotel', itemId in client hotels, status='Confirmed', bookingToDate >= now
    const activeHotelBookings = await Booking.countDocuments({
      itemType: 'Hotel',
      itemId: { $in: hotelIds },
      status: 'Confirmed',
      bookingToDate: { $gte: now }
    });

    // Events: embedded bookings where bookingDate >= now (no status field)
    const eventsWithBookings = await Event.find({ owner: req.user.id }).select('bookings price');
    const activeEventBookings = eventsWithBookings.reduce((sum, event) => {
      return sum + event.bookings.filter(b => new Date(b.bookingDate) >= now).length;
    }, 0);

    // Monthly Revenue
    // Hotels: aggregate totalPrice for matching bookings created this month
    const revenueHotel = await Booking.aggregate([
      {
        $match: {
          itemType: 'Hotel',
          itemId: { $in: hotelIds },
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

    // Events: sum price * seats for bookings created this month
    const revenueEvent = eventsWithBookings.reduce((sum, event) => {
      return sum + event.bookings
        .filter(b => b.bookedAt && new Date(b.bookedAt) >= startOfMonth)
        .reduce((total, b) => total + (event.price * b.seats || 0), 0);
    }, 0);

    const stats = {
      hotels: hotelsCount,
      bookings: activeHotelBookings + activeEventBookings,
      events: eventsCount,
      revenue: Math.round((revenueHotel[0]?.totalRevenue || 0) + revenueEvent)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('getClientStats error:', error);
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


