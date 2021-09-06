const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.REACT_APP_BUCKET_REGION,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
  }),
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: process.env.REACT_APP_BUCKET_NAME },
});

module.exports = s3;
