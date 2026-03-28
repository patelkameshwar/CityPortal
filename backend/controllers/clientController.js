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

    // ✅ EVENT ACTIVE BOOKINGS (future bookingDate >= today)
    const activeEventBookings = await Booking.countDocuments({
      itemType: 'Event',
      itemId: { $in: eventIds },
      status: 'Confirmed',
      $or: [
        { bookingDate: { $gte: now, $ne: null } },
        { bookingToDate: { $gte: now, $ne: null } }
      ]
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

exports.getClientById = async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    if (!client || client.role !== 'client') {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, client });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.title !== undefined) updates.name = req.body.title;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }
    const client = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    if (!client || client.role !== 'client') {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, client });
  } catch (error) {
    console.error('Update client by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientAnalytics = async (req, res) => {
  try {
    const { period = 'day' } = req.query; 
    const now = new Date();
    
    let periodStart, generatePeriods;

    // ✅ DAY (Last 30 days)
    if (period === 'day') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 30);

      generatePeriods = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);

          const key = date.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
          });

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

    // ✅ MONTH (Last 12 months)
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

    // ✅ YEAR (Last 5 years)
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

    // ✅ HOTEL ANALYTICS (FIXED TIMEZONE)
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
              date: '$createdAt',
              timezone: 'Asia/Kolkata' // ✅ FIX
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

    // ✅ EVENT ANALYTICS (FIXED TIMEZONE)
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
              date: '$createdAt',
              timezone: 'Asia/Kolkata' // ✅ FIX
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

    // ✅ FINAL CHART DATA
    const chartData = periods.map(p => {
      const hotel = hotelData[p.key] || { activeBookings: 0, revenue: 0 };
      const event = eventData[p.key] || { activeBookings: 0, revenue: 0 };

      return {
        month: p.key,
        label: p.label,
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

/**
 * DELETE CLIENT
 * Access: Admin only
 */
exports.deleteClient = async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    if (!client || client.role !== 'client') {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    // Cancel all related bookings (client-owned hotels/events)
    await Booking.updateMany(
      { 
        $or: [
          { 'owner': client._id },
          { 'itemType': { $in: ['Hotel', 'Event'] }, 'owner': client._id }
        ]
      },
      { status: 'Cancelled' }
    );

    // Delete client-owned hotels and events first
    await Hotel.deleteMany({ owner: client._id });
    await Event.deleteMany({ owner: client._id });

    // Finally delete user
    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client and related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
