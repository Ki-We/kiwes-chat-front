const { Room } = require("./model");

const catch_error = (err, res, msg) => {
  console.error(err);
  console.log(`err : `, msg);
  res.status(400).send({ msg });
};
module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_HOST,
      credentials: true,
    },
  });

  io.on("connection", function (socket) {
    // --(1)-- 본인 방에서 빠져나와 lobby에 참여
    socket.leave(socket.id);
    socket.join("lobby");
    // --(1)--
    socket.on("entry", async () => {
      console.log(`${socket.id} entry`);
      const rooms = await getRooms();
      socket.emit("roomList", { rooms });
    });

    socket.on("createRoom", async (data) => {
      await Room.create(data).catch((err) =>
        catch_error(err, res, "Failed: create room")
      );

      const rooms = await getRooms();
      socket.emit("roomList", { rooms });
    });
    socket.on("enterRoom", async (data) => {
      socket.leave("lobby");
      socket.join(data.id);
      const date = new Date();
      const time =
        date.getHours() + " : " + date.getMinutes() + " : " + date.getSeconds();
      io.in(data.id).emit("sendMsg", {
        writer: "시스템",
        msg: `welcome ${socket.id}`,
        time,
      });
    });
    socket.on("sendMsg", async (data) => {
      const date = new Date();
      const time =
        date.getHours() + " : " + date.getMinutes() + " : " + date.getSeconds();
      const name = socket.rooms.values().next().value;
      io.in(name).emit("sendMsg", {
        writer: socket.id,
        msg: data.msg,
        time,
      });
    });

    socket.on("disconnect", function () {
      console.log("Server Socket Disconnected");
    });
  });
};

const getRooms = async () => {
  const rooms = await Room.findAll().catch((err) =>
    catch_error(err, res, "Failed: Get Rooms")
  );
  return rooms;
};
