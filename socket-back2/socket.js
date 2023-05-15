var express = require("express");
var app = express();
var http = require("http").Server(app);
const dotenv = require("dotenv");

dotenv.config();

const io = require("socket.io")(http, {
  cors: {
    origin: process.env.CLIENT_HOST,
    methods: ["GET", "POST"],
  },
});
io.on("connection", function (socket) {
  console.log("Server Socket Connected");

  console.log(socket.id);
  io.emit("entry", socket.id);

  socket.on("sendMSG", (data) => {
    console.log(data["msg"]);
    io.emit("newMSG", data);
  });

  socket.on("disconnect", function () {
    console.log("Server Socket Disconnected");
  });
});

http.listen(process.env.PORT, function () {
  console.log(`Listening on *:${process.env.PORT}`);
});
