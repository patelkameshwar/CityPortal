const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const createUpload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `city-portal/${folder}`,
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
  return multer({ storage });
};

module.exports = createUpload;

