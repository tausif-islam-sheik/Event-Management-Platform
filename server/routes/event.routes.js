const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
} = require('../controllers/event.controller');

// Public routes
router.get('/', getAllEvents);
router.get('/my-events', verifyToken, checkRole('organizer'), getMyEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', verifyToken, checkRole('organizer'), createEvent);
router.put('/:id', verifyToken, checkRole('organizer'), updateEvent);
router.delete('/:id', verifyToken, checkRole('organizer', 'admin'), deleteEvent);
router.post('/:id/register', verifyToken, checkRole('user'), registerForEvent);
router.delete('/:id/register', verifyToken, checkRole('user'), cancelRegistration);

module.exports = router;
