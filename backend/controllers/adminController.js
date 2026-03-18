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

exports.getAdminAnalytics = async (req, res) => {
  try {
    const { period = 'day' } = req.query; 
    const now = new Date();
    
    let periodStart, generatePeriods;

    // DAY (Last 30 days)
    if (period === 'day') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 30);
      generatePeriods = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const key = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          days.push({
            key,
            label: date.toLocaleDateString('en-US', {
              timeZone: 'Asia/Kolkata',
              month: 'short',
              day: 'numeric'
            })
          });
        }
        return days;
      };

    // MONTH (Last 12 months)
    } else if (period === 'month') {
      periodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      generatePeriods = () => {
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = date.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit'
          }).slice(0, 7);
          months.push({
            key,
            label: date.toLocaleDateString('en-US', {
              timeZone: 'Asia/Kolkata',
              month: 'long',
              year: 'numeric'
            })
          });
        }
        return months;
      };

    // YEAR (Last 5 years)
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

    // Category-specific analytics
    const bookingMatch = {
      status: 'Confirmed',
      createdAt: { $gte: periodStart }
    };

    // Hotels
    const hotelsAnalytics = await Booking.aggregate([
      { $match: { ...bookingMatch, itemType: 'Hotel' } },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      },
      { $group: { _id: '$periodKey', hotelsBookings: { $sum: 1 } } }
    ]);

    // Events
    const eventsAnalytics = await Booking.aggregate([
      { $match: { ...bookingMatch, itemType: 'Event' } },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      },
      { $group: { _id: '$periodKey', eventsBookings: { $sum: 1 } } }
    ]);

    // Tourism
    const tourismAnalytics = await Booking.aggregate([
      { $match: { ...bookingMatch, itemType: 'Tourism' } },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      },
      { $group: { _id: '$periodKey', tourismBookings: { $sum: 1 } } }
    ]);

    // Revenue (all)
    const revenueAnalytics = await Booking.aggregate([
      { $match: bookingMatch },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      },
      { $group: { _id: '$periodKey', revenue: { $sum: '$totalPrice' } } }
    ]);

    // New Clients (User registrations)
    const newClientsAnalytics = await User.aggregate([
      {
        $match: {
          role: 'client',
          createdAt: { $gte: periodStart }
        }
      },
      {
        $addFields: {
          periodKey: {
            $dateToString: {
              format: period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          }
        }
      },
      { $group: { _id: '$periodKey', newClients: { $sum: 1 } } }
    ]);

    // Merge all data
    const hotelsData = Object.fromEntries(hotelsAnalytics.map(item => [item._id, item.hotelsBookings || 0]));
    const eventsData = Object.fromEntries(eventsAnalytics.map(item => [item._id, item.eventsBookings || 0]));
    const tourismData = Object.fromEntries(tourismAnalytics.map(item => [item._id, item.tourismBookings || 0]));
    const revenueData = Object.fromEntries(revenueAnalytics.map(item => [item._id, Math.round(item.revenue || 0)]));
    const clientsData = Object.fromEntries(newClientsAnalytics.map(item => [item._id, item.newClients || 0]));

    const periods = generatePeriods();
    const chartData = periods.map(p => ({
      month: p.label,
      hotelsBookings: hotelsData[p.key] || 0,
      eventsBookings: eventsData[p.key] || 0,
      tourismBookings: tourismData[p.key] || 0,
      newClients: clientsData[p.key] || 0,
      revenue: revenueData[p.key] || 0
    }));



    res.json({ success: true, data: chartData });

  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


