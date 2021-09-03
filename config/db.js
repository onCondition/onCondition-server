require("dotenv").config();
const mongoose = require("mongoose");
const uri = process.env.MONGO_DB;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
}, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successful");
  }
});

const db = mongoose.connection;

db.on("error", (err) => console.log(`Connection error ${err}`));
db.once("open", () => console.log("Connected to DB!"));
