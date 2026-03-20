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

router.get('/stats', authMiddleware, getClientStats);

router.get('/hotels/client', authMiddleware, getClientHotels);

router.get('/analytics', authMiddleware, require('../controllers/clientController').getClientAnalytics);

router.get('/events', authMiddleware, getClientEvents);

router.get('/', authMiddleware, roleMiddleware('admin'), getAllClients);

router.get('/:id', authMiddleware, roleMiddleware('admin'), getClientById);

const upload = require('../middleware/uploadMiddleware')('profiles');
router.put('/:id', upload.none(), authMiddleware, roleMiddleware('admin'), updateClientById);

router.delete('/:id', authMiddleware, roleMiddleware('admin'), require('../controllers/clientController').deleteClient);

module.exports = router;

