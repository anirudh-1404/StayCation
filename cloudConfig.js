const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: 'doxsxn3yb',
    api_key: '763474955449596',
    api_secret: 'rqLltmE5AOZhatvumUs5PsiZgm4',
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'StayCation_DEV',
        allowedFormats: ['jpeg', "jpg", "png"],
    }
})

module.exports = {
    cloudinary,
    storage,
}