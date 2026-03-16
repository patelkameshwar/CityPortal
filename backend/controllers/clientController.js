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
    
    // Add bookings count
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

    // Events: Confirmed bookings from Booking model where bookingDate >= now
    const eventQueryEvents = await Event.find({ owner: req.user.id }).select('_id');
    const eventQueryIds = eventQueryEvents.map(e => e._id);
    const activeEventBookings = await Booking.countDocuments({
      itemType: 'Event',
      itemId: { $in: eventQueryIds },
      status: 'Confirmed',
      bookingDate: { $gte: now }
    });

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

    // Events: Confirmed revenue from Booking model created this month
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
    const revenueEventTotal = revenueEvent[0]?.totalRevenue || 0;

    const stats = {
      hotels: hotelsCount,
      bookings: activeHotelBookings + activeEventBookings,
      events: eventsCount,
      revenue: Math.round((revenueHotel[0]?.totalRevenue || 0) + revenueEventTotal)
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
    const { period = 'day' } = req.query; // day, month, year - default day
    const now = new Date();
    
    // FIXED: Use PAST 12 months for monthly (Apr2024 - Mar2025)
    let periodStart, generatePeriods, formatKey, formatLabel;

    if (period === 'day') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30); // last 30 days
      generatePeriods = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          days.push({
            key: date.toISOString().slice(0,10), // YYYY-MM-DD
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
        }
        return days;
      };
      formatKey = (date) => {
        if (!isValidDate(date)) return null;
        const d = new Date(date);
        return d.toISOString().slice(0,10);
      };
      formatLabel = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'month') {
      // FIXED: Start 12 months BACK from now
      periodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1); 
      generatePeriods = () => {
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            key: date.toISOString().slice(0,7), // YYYY-MM
            label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
        }
        return months;
      };
      formatKey = (date) => safeFormatKey(date, 'month');
      formatLabel = (date) => {
        const d = new Date(date + '-01');
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      };
    } else { // year
      periodStart = new Date(now.getFullYear() - 5, 0, 1); // last 5 years
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
      formatKey = (date) => safeFormatKey(date, 'year');
      formatLabel = (date) => new Date(date).getFullYear().toString();
    }

    console.log(`Analytics period=${period}, start=${periodStart.toISOString().slice(0,10)}`);

    // Get client's hotel and event IDs
    const clientHotels = await Hotel.find({ owner: req.user.id }).select('_id');
    const clientEvents = await Event.find({ owner: req.user.id }).select('_id');
    const hotelIds = clientHotels.map(h => h._id);
    const eventIds = clientEvents.map(e => e._id);

    const periods = generatePeriods();

    // Hotel analytics from Booking collection - FIXED aggregation format
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
          count: { $sum: 1 },
          activeBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$bookingToDate', now ] }, { $ne: ['$bookingToDate', null] }] },
                1,
                0
              ]
            }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('Hotel analytics:', JSON.stringify(hotelAnalytics, null, 2));

    const hotelData = {};
    hotelAnalytics.forEach(item => {
      hotelData[item._id] = item;
    });

    // Event analytics from Booking model (confirmed only)
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
          count: { $sum: 1 },
          activeBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$bookingDate', now ] }, { $ne: ['$bookingDate', null] }] },
                1,
                0
              ]
            }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const eventAnalytics = {};
    eventAnalyticsRaw.forEach(item => {
      eventAnalytics[item._id] = {
        activeBookings: item.activeBookings || 0,
        revenue: item.revenue || 0
      };
    });

    console.log('Event analytics keys:', Object.keys(eventAnalytics));

    // Combine data
    const chartData = periods.map(p => {
      const hotel = hotelData[p.key] || { activeBookings: 0, revenue: 0, count: 0 };
      const event = eventAnalytics[p.key] || { activeBookings: 0, revenue: 0 };
      return {
        month: p.label,
        activeBookings: hotel.activeBookings + event.activeBookings,
        revenue: Math.round(hotel.revenue + event.revenue)
      };
    });

    console.log('Final chartData sample:', JSON.stringify(chartData.slice(-3), null, 2));

    res.json({ success: true, data: chartData, period });
  } catch (error) {
    console.error('getClientAnalytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

