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
    origin: ["*"],
  })
);

dotenv.config({ path: path.join(__dirname, "./.env") });

require("./socket2")(http);
app.use("/", require("./route"));

http.listen(process.env.PORT, function () {
  console.log(`Listening on *:${process.env.PORT}`);
});
