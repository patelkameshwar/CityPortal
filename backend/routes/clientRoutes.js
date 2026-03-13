const express = require('express');
const { getClientStats } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware('client'), getClientStats);

module.exports = router;

