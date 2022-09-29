const cloudinary = require('cloudinary');

exports.uploadImage =  async(image,folder) => {
    const result =  await cloudinary.v2.uploader.upload(image.tempFilePath, {
        folder: `${folder}`
    });
    console.log(result)
    return {
        public_id: result.public_id,
        url: result.secure_url
    }
}
