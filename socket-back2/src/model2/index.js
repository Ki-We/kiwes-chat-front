const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASSWORD}@${process.env.DB_MONGO_CLUSTER}.0q2wiuh.mongodb.net/?retryWrites=true&w=majority`,
    { dbName: "kiwes" }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Chat = require("./Chat");
db.Log = require("./Log");

db.regex = (pattern) => new RegExp(`${pattern}.*`);

module.exports = db;
