const express = require("express");
const router = express.Router();

const {
  getClientStats,
  getAllClients,
  getClientHotels,
  getClientEvents
} = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Client stats
router.get('/stats', authMiddleware, getClientStats);

// Client hotels
router.get('/hotels/client', authMiddleware, getClientHotels);

// Client analytics chart data
router.get('/analytics', authMiddleware, require('../controllers/clientController').getClientAnalytics);

// Client events - NEW ENDPOINT (Fixes MyEvents 404)
router.get('/events', authMiddleware, getClientEvents);

// Admin get all clients
router.get('/', authMiddleware, roleMiddleware('admin'), getAllClients);


module.exports = router;

