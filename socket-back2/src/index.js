const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const dotenv = require("dotenv");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

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
app.use("/", require("./route"));

http.listen(process.env.PORT, function () {
  console.log(`Listening on *:${process.env.PORT}`);
});
