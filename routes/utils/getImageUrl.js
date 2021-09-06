const s3 = require("../../config/AWS");

async function getImgUrl(file) {
  const fileName = file.name;
  const photoKey = "album1/" + fileName;

  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: photoKey,
    Body: file,
  };

  const stored = await s3.upload(params).promise();

  return stored.Location;
}

module.exports = getImgUrl;
