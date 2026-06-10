const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const OrganizerRequest = require('../models/OrganizerRequest');
const Event = require('../models/Event');

// POST /api/users/request-organizer  — User only
router.post('/request-organizer', verifyToken, checkRole('user'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required.' });
    }

    const existing = await OrganizerRequest.findOne({ userId: req.user._id, status: 'pending' });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a pending organizer request.' });
    }

    const request = new OrganizerRequest({ userId: req.user._id, reason });
    await request.save();

    return res.status(201).json({ success: true, message: 'Organizer request submitted.', data: { request } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/my-request  — User only
router.get('/my-request', verifyToken, checkRole('user', 'organizer'), async (req, res) => {
  try {
    const request = await OrganizerRequest.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Request fetched.', data: { request } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/my-events  — User's registered events
router.get('/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user._id }).sort({ date: 1 });
    return res.status(200).json({ success: true, message: 'Registered events fetched.', data: { events } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
