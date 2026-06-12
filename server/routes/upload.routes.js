const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/upload.controller');

router.post(
  '/image',
  verifyToken,
  checkRole('organizer', 'admin'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadImage
);

module.exports = router;
