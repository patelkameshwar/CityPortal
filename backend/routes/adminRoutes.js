const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { getAllClients } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware('admin'), getAdminStats);

router.get('/clients', authMiddleware, roleMiddleware('admin'), getAllClients);

module.exports = router;

