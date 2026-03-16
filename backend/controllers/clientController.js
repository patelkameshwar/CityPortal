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

    // Events: embedded bookings where bookingDate >= now (no status field)
    const eventsWithBookings = await Event.find({ owner: req.user.id }).select('bookings price');
    const activeEventBookings = eventsWithBookings.reduce((sum, event) => {
      return sum + event.bookings.filter(b => b.bookingDate && isValidDate(b.bookingDate) && new Date(b.bookingDate) >= now).length;
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
        .filter(b => b.bookedAt && isValidDate(b.bookedAt) && new Date(b.bookedAt) >= startOfMonth)
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

exports.getClientAnalytics = async (req, res) => {
  try {
    const { period = 'day' } = req.query; // day, month, year - default day
    const now = new Date();
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
      formatKey = (date) => safeFormatKey(date, 'day');
      formatLabel = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'month') {
      periodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1); // last 12 months
      generatePeriods = () => {
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            key: date.toISOString().slice(0,7), // YYYY-MM
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          });
        }
        return months;
      };
      formatKey = (date) => safeFormatKey(date, 'month');
      formatLabel = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

    // Get client's hotel and event IDs
    const clientHotels = await Hotel.find({ owner: req.user.id }).select('_id');
    const clientEvents = await Event.find({ owner: req.user.id }).select('_id');
    const hotelIds = clientHotels.map(h => h._id);
    const eventIds = clientEvents.map(e => e._id);

    const periods = generatePeriods();

    // Hotel analytics from Booking collection
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
          periodKey: formatKey('$createdAt')
        }
      },
      {
        $group: {
          _id: '$periodKey',
          activeBookings: {
            $sum: {
              $cond: [
                { $gte: ['$bookingToDate', now] },
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

    const hotelData = {};
    hotelAnalytics.forEach(item => {
      hotelData[item._id] = item;
    });

    // Event analytics (embedded bookings)
    const eventsWithBookings = await Event.find({ _id: { $in: eventIds } });
    const eventAnalytics = {};
    eventsWithBookings.forEach(event => {
      event.bookings.forEach(booking => {
        if (booking.bookedAt && isValidDate(booking.bookedAt)) {
          const periodKey = formatKey(booking.bookedAt);
          if (periodKey && !eventAnalytics[periodKey]) {
            eventAnalytics[periodKey] = { activeBookings: 0, revenue: 0 };
          }
          if (booking.bookingDate && isValidDate(booking.bookingDate) && new Date(booking.bookingDate) >= now) {
            eventAnalytics[periodKey].activeBookings += 1;
          }
          eventAnalytics[periodKey].revenue += event.price * booking.seats || 0;
        }
      });
    });

    // Combine data
    const chartData = periods.map(p => {
      const hotel = hotelData[p.key] || { activeBookings: 0, revenue: 0 };
      const event = eventAnalytics[p.key] || { activeBookings: 0, revenue: 0 };
      return {
        month: p.label,
        activeBookings: hotel.activeBookings + event.activeBookings,
        revenue: Math.round(hotel.revenue + event.revenue)
      };
    });

    res.json({ success: true, data: chartData, period });
  } catch (error) {
    console.error('getClientAnalytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};




