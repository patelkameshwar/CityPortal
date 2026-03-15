const cloudinary = require('../../config/cloudinary.js');

/**
 * Delete multiple Cloudinary images by public_id or URL
 * Extracts public_id from URL if needed
 */
const deleteCloudinaryImages = async (imageUrlsOrIds) => {
  try {
    const deletePromises = imageUrlsOrIds.map(async (image) => {
      let publicId;
      
      // If it's a full URL, extract public_id
      if (typeof image === 'string' && image.includes('cloudinary')) {
        // Extract public_id from URL like https://res.cloudinary.com/demo/image/upload/v1234567890/public_id.jpg
        const parts = image.split('/');
        const filenamePart = parts[parts.length - 1];
        publicId = filenamePart.split('.')[0];
        
        // Fallback: remove version and extension
        if (publicId.includes('v')) {
          publicId = publicId.replace(/v\d+/, '');
        }
      } else {
        publicId = image;
      }
      
      if (publicId) {
        return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    });
    
    const results = await Promise.allSettled(deletePromises);
    
    // Log failures but don't fail the whole operation
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`Failed to delete ${failed.length} images from Cloudinary:`, failed.map(f => f.reason.message));
    }
    
    return { success: true, failed: failed.length };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { deleteCloudinaryImages };
