require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.MONGO_DB,
});

module.exports = admin;
