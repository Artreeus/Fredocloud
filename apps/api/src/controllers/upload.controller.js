const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

async function uploadAvatar(req, res, next) {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        message: "Cloudinary credentials are not configured on the API server"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Avatar file is required"
      });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "fredocloud/avatars",
      public_id: `${req.user.id}-${Date.now()}`,
      resource_type: "image"
    });

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadAvatar
};
