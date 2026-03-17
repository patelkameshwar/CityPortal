const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

const safeFormatKey = (date, period) => {
  if (!isValidDate(date)) {
    console.warn('Skipping invalid date:', date);
    return null;
  }
  const d = new Date(date);
  if (period === 'year') {
    return d.getFullYear().toString();
  } else if (period === 'month') {
    return d.toISOString().slice(0,7);
  } else {
    return d.toISOString().slice(0,10);
  }
};


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
    
    const hotelsWithCount = hotels.map(hotel => ({
      ...hotel._doc,
      bookingsCount: hotel.bookings ? hotel.bookings.filter(b => b.status === 'Confirmed' && b.bookingToDate && isValidDate(b.bookingToDate) && new Date(b.bookingToDate) >= new Date()).length : 0
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

    // ✅ Get client hotels & events
    const clientHotels = await Hotel.find({ owner: req.user.id }).select('_id');
    const clientEvents = await Event.find({ owner: req.user.id }).select('_id');

    const hotelIds = clientHotels.map(h => h._id);
    const eventIds = clientEvents.map(e => e._id);

    const hotelsCount = hotelIds.length;
    const eventsCount = eventIds.length;

    // ✅ HOTEL ACTIVE BOOKINGS (future checkout)
    const activeHotelBookings = await Booking.countDocuments({
      itemType: 'Hotel',
      itemId: { $in: hotelIds },
      status: 'Confirmed',
      bookingToDate: { $gte: now }
    });

    // ✅ EVENT BOOKINGS (FIXED 🔥)
    // Removed strict date filter because bookingDate may be missing or inconsistent
    const activeEventBookings = await Booking.countDocuments({
      itemType: 'Event',
      itemId: { $in: eventIds },
      status: 'Confirmed'
    });

    // ✅ HOTEL REVENUE (current month)
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

    // ✅ EVENT REVENUE (current month)
    const revenueEvent = await Booking.aggregate([
      {
        $match: {
          itemType: 'Event',
          itemId: { $in: eventIds },
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

    const totalRevenue =
      (revenueHotel[0]?.totalRevenue || 0) +
      (revenueEvent[0]?.totalRevenue || 0);

    // ✅ FINAL STATS
    const stats = {
      hotels: hotelsCount,
      events: eventsCount,
      bookings: activeHotelBookings + activeEventBookings, // ✅ now includes events properly
      activeHotelBookings,
      activeEventBookings,
      revenue: Math.round(totalRevenue)
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

exports.getClientAnalytics = async (req, res) => {
  try {
    const { period = 'day' } = req.query; 
    const now = new Date();
    
    let periodStart, generatePeriods;

    // ✅ DAY
    if (period === 'day') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30); 

      generatePeriods = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          days.push({
            key: date.toISOString().slice(0,10),
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
        }
        return days;
      };

    // ✅ MONTH
    } else if (period === 'month') {
      periodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1); 

      generatePeriods = () => {
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

          // ✅ FIXED (no timezone issue)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          months.push({
            key,
            label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
        }
        return months;
      };

    // ✅ YEAR
    } else {
      periodStart = new Date(now.getFullYear() - 5, 0, 1); 

      generatePeriods = () => {
        const years = [];
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() - i;

          years.push({
            key: year.toString(),
            label: year.toString()
          });
        }
        return years;
      };
    }

    const clientHotels = await Hotel.find({ owner: req.user.id }).select('_id');
    const clientEvents = await Event.find({ owner: req.user.id }).select('_id');

    const hotelIds = clientHotels.map(h => h._id);
    const eventIds = clientEvents.map(e => e._id);

    const periods = generatePeriods();

    // ✅ HOTEL ANALYTICS
    const hotelAnalytics = await Booking.aggregate([
      {
        $match: {
          itemType: 'Hotel',
          itemId: { $in: hotelIds },
          status: 'Confirmed',
          createdAt: { $gte: periodStart }
        }
      },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $group: {
          _id: '$periodKey',
          activeBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$bookingToDate', now] }, { $ne: ['$bookingToDate', null] }] },
                1,
                0
              ]
            }
          },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const hotelData = {};
    hotelAnalytics.forEach(item => {
      hotelData[item._id] = item;
    });

    // ✅ EVENT ANALYTICS
    const eventAnalyticsRaw = await Booking.aggregate([
      {
        $match: {
          itemType: 'Event',
          itemId: { $in: eventIds },
          status: 'Confirmed',
          createdAt: { $gte: periodStart }
        }
      },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $group: {
          _id: '$periodKey',
          activeBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$bookingDate', now] }, { $ne: ['$bookingDate', null] }] },
                1,
                0
              ]
            }
          },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const eventData = {};
    eventAnalyticsRaw.forEach(item => {
      eventData[item._id] = item;
    });

    // ✅ FINAL CHART DATA (🔥 FIX APPLIED HERE)
    const chartData = periods.map(p => {
      const hotel = hotelData[p.key] || { activeBookings: 0, revenue: 0 };
      const event = eventData[p.key] || { activeBookings: 0, revenue: 0 };

      return {
        month: p.key,        // ✅ FIX (was p.label ❌)
        label: p.label,      // optional (for UI)
        activeBookings: (hotel.activeBookings || 0) + (event.activeBookings || 0),
        revenue: Math.round((hotel.revenue || 0) + (event.revenue || 0))
      };
    });

    res.json({ success: true, data: chartData });

  } catch (error) {
    console.error('getClientAnalytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
