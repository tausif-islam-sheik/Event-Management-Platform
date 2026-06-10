const User = require('../models/User');
const Event = require('../models/Event');
const OrganizerRequest = require('../models/OrganizerRequest');

// GET /api/admin/requests  — All organizer requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await OrganizerRequest.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: 'Requests fetched.', data: { requests } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/requests/:id/approve
const approveRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    request.status = 'approved';
    await request.save();

    await User.findByIdAndUpdate(request.userId, { role: 'organizer' });

    return res.status(200).json({ success: true, message: 'Request approved. User is now an organizer.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    request.status = 'rejected';
    await request.save();

    return res.status(200).json({ success: true, message: 'Request rejected.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Users fetched.', data: { users } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const pendingRequests = await OrganizerRequest.countDocuments({ status: 'pending' });

    return res.status(200).json({
      success: true,
      message: 'Stats fetched.',
      data: { totalUsers, totalOrganizers, totalEvents, pendingRequests },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/events/:id
const adminDeleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.status(200).json({ success: true, message: 'Event deleted by admin.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllRequests, approveRequest, rejectRequest, getAllUsers, getStats, adminDeleteEvent };
