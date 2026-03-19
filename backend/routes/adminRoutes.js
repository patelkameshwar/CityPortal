const express = require('express');
const { getAdminStats, getRecentClients, getRecentHotels, getRecentEvents, getRecentTourism, getAdminAnalytics, getClientById } = require('../controllers/adminController');
const { getAllClients } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware('admin'), getAdminStats);
router.get('/recent-clients', authMiddleware, roleMiddleware('admin'), getRecentClients);
router.get('/recent-hotels', authMiddleware, roleMiddleware('admin'), getRecentHotels);
router.get('/recent-events', authMiddleware, roleMiddleware('admin'), getRecentEvents);
router.get('/recent-tourism', authMiddleware, roleMiddleware('admin'), getRecentTourism);
router.get('/clients', authMiddleware, roleMiddleware('admin'), getAllClients);
router.get('/clients/:id', authMiddleware, roleMiddleware('admin'), getClientById);
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAdminAnalytics);

module.exports = router;

