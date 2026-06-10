const Event = require('../models/Event');

// GET /api/events  — Public
const getAllEvents = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(filter)
      .populate('organizerId', 'name email')
      .sort({ date: 1 });

    return res.status(200).json({ success: true, message: 'Events fetched.', data: { events } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id  — Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email')
      .populate('registeredUsers', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({ success: true, message: 'Event fetched.', data: { event } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events  — Organizer only
const createEvent = async (req, res) => {
  try {
    const { title, description, bannerImage, date, location, capacity, category } = req.body;

    if (!title || !description || !date || !location || !capacity) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const event = new Event({
      title,
      description,
      bannerImage: bannerImage || '',
      organizerId: req.user._id,
      date,
      location,
      capacity,
      category: category || 'other',
    });

    await event.save();

    return res.status(201).json({ success: true, message: 'Event created.', data: { event } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/events/:id  — Organizer only (own events)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event.' });
    }

    const allowedFields = ['title', 'description', 'bannerImage', 'date', 'location', 'capacity', 'category', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({ success: true, message: 'Event updated.', data: { event } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id  — Organizer (own) or Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const isOwner = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    await event.deleteOne();

    return res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/register  — User only
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const alreadyRegistered = event.registeredUsers.includes(req.user._id);
    if (alreadyRegistered) {
      return res.status(409).json({ success: false, message: 'Already registered for this event.' });
    }

    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
    }

    event.registeredUsers.push(req.user._id);
    await event.save();

    return res.status(200).json({ success: true, message: 'Registered for event successfully.', data: { event } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id/register  — User only (cancel registration)
const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const isRegistered = event.registeredUsers.includes(req.user._id);
    if (!isRegistered) {
      return res.status(400).json({ success: false, message: 'You are not registered for this event.' });
    }

    event.registeredUsers = event.registeredUsers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await event.save();

    return res.status(200).json({ success: true, message: 'Registration cancelled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/my-events  — Organizer only
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Your events fetched.', data: { events } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
};
