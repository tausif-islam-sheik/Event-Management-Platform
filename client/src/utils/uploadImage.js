import axiosInstance from './axiosInstance';

/**
 * Upload an image via the server to Cloudinary and return the public URL.
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<string>} The public image URL
 */
export const uploadImage = async (file, folder = 'eventhub/events/banners') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await axiosInstance.post('/upload/image', formData);
  return res.data.data.url;
};
