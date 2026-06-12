const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const folder = req.body.folder || 'eventhub/events/banners';

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
};

module.exports = { uploadImage };
