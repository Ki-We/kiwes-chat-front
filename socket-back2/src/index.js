const express = require("express");
const app = express();
const http = require("http").Server(app);
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "./.env") });
const sequelize = require("./model").sequelize;
sequelize
  .sync()
  .then(() => {
    console.log("DB connect success");
  })
  .catch((err) => {
    console.log(err);
  });

require("./socket")(http);

http.listen(process.env.PORT, function () {
  console.log(`Listening on *:${process.env.PORT}`);
});
