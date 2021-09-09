const s3 = require("../../config/AWS");

async function getImgUrl(image) {
  const imageName = image.name;
  const photoKey = "album1/" + imageName;

  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: photoKey,
    Body: image.url,
  };

  const stored = await s3.upload(params).promise();

  return stored.Location;
}

module.exports = getImgUrl;
