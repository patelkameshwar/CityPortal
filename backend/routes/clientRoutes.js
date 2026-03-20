const express = require("express");
const router = express.Router();

const {
  getClientStats,
  getAllClients,
  getClientHotels,
  getClientEvents,
  getClientById,
  updateClientById
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

// Test sample data - TEMP for dashboard fix
// router.post('/test-sample-data', authMiddleware, require('../controllers/testDataController').createSampleData);  // REMOVED: Test sample data

// Admin get all clients
router.get('/', authMiddleware, roleMiddleware('admin'), getAllClients);

// Admin get single client by ID
router.get('/:id', authMiddleware, roleMiddleware('admin'), getClientById);

// Admin update single client by ID
const upload = require('../middleware/uploadMiddleware')('profiles');
router.put('/:id', upload.none(), authMiddleware, roleMiddleware('admin'), updateClientById);

// Admin delete single client by ID
router.delete('/:id', authMiddleware, roleMiddleware('admin'), require('../controllers/clientController').deleteClient);

module.exports = router;

