const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getAllUsers,
  getStats,
  adminDeleteEvent,
} = require('../controllers/admin.controller');

// All admin routes require auth + admin role
router.use(verifyToken, checkRole('admin'));

router.get('/requests', getAllRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);
router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.delete('/events/:id', adminDeleteEvent);

module.exports = router;
