const express = require("express");
const router = express.Router();

const {
  getClientStats,
  getAllClients,
  getClientHotels
} = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Client stats
router.get('/stats', authMiddleware, getClientStats);

// Client hotels - NEW ENDPOINT
router.get('/hotels/client', authMiddleware, getClientHotels);

// Admin get all clients
router.get('/', authMiddleware, roleMiddleware('admin'), getAllClients);

module.exports = router;

