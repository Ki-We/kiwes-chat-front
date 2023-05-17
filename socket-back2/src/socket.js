const { Room, Chat } = require("./model");

const catch_error = (err, res, msg) => {
  console.error(err);
  console.log(`err : `, msg);
  res.status(400).send({ msg });
};
const nicknameList = {};
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

    socket.on("nickname", async (info) => {
      nicknameList[socket.id] = info.nickname;
      console.log("nicknameList : ", nicknameList);
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

      const initChat = { room_ID: data.id, chat: "[]" };
      const chatInfo = await Chat.findCreateFind({
        initChat,
        where: { room_ID: data.id },
      });
      const msgs = JSON.parse(chatInfo[0].chat);

      io.in(data.id).emit("msgList", msgs);
      io.in(data.id).emit("sendMsg", {
        writer: "시스템",
        msg: `welcome ${nicknameList[socket.id] || socket.id}`,
        time,
      });
    });
    socket.on("sendMsg", async (data) => {
      const date = new Date();
      const time =
        date.getHours() + " : " + date.getMinutes() + " : " + date.getSeconds();
      const name = socket.rooms.values().next().value;
      const info = {
        writer: nicknameList[socket.id] || socket.id,
        msg: data.msg,
        time,
      };

      const chat = await Chat.findOne({ room_ID: name });
      const msgs = JSON.parse(chat.chat);
      msgs.push(info);

      await Chat.update(
        { chat: JSON.stringify(msgs) },
        { where: { id: chat.id } }
      );

      io.in(name).emit("sendMsg", info);
    });

    socket.on("disconnect", function () {
      delete nicknameList[socket.id];
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
