const { Room, Chat } = require("./model");

const catch_error = (err, socket, msg) => {
  console.error(err);
  console.log(`err : `, msg);
  socket.send("error", { msg });
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
    });
    socket.on("createRoom", async (data) => {
      await Room.create(data).catch((err) => {
        catch_error(err, socket, "Failed:create room");
        return;
      });

      const rooms = await getRooms();
      socket.emit("roomList", { rooms });
    });
    socket.on("enterRoom", async (data) => {
      console.log(nicknameList);
      if (nicknameList[socket.id] == undefined) {
        catch_error(null, socket, "닉네임 없이는 접근할 수 없습니다.");
        return;
      }
      socket.leave("lobby");

      socket.join(data.id);
      const time = getTime();

      const initChat = { room_ID: data.id, chat: "[]" };
      const chatInfo = await Chat.findCreateFind({
        initChat,
        where: { room_ID: data.id },
      });
      const roomInfo = await Room.findOne({ where: { id: data.id } });
      const msgs = JSON.parse(chatInfo[0].chat);

      io.in(data.id).emit("msgList", msgs);
      io.in(data.id).emit("sendMsg", {
        writer: "system",
        msg: `${nicknameList[socket.id] || socket.id}님이 입장하셨습니다.`,
        time,
      });
      if (roomInfo.notice != null)
        io.in(data.id).emit("notice", JSON.parse(roomInfo.notice));
    });
    socket.on("sendMsg", async (data) => {
      const room = socket.rooms.values().next().value;
      const time = getTime();
      const info = {
        writer: nicknameList[socket.id] || socket.id,
        ...data,
        time,
      };

      const chat = await Chat.findOne({ room_ID: room });
      const msgs = JSON.parse(chat.chat);
      msgs.push(info);

      await Chat.update(
        { chat: JSON.stringify(msgs) },
        { where: { id: chat.id } }
      );

      io.in(room).emit("sendMsg", info);
    });
    socket.on("notice", async (data) => {
      const room = socket.rooms.values().next().value;
      const time = getTime();
      const notice = {
        writer: nicknameList[socket.id] || socket.id,
        ...data,
        time,
      };
      console.log(notice);
      console.log(room);
      await Room.update(
        { notice: JSON.stringify(notice) },
        { where: { id: room } }
      );
      io.in(room).emit("notice", notice);
    });

    socket.on("disconnect", function () {
      delete nicknameList[socket.id];
      console.log("Server Socket Disconnected");
    });
  });
};

const getRooms = async () => {
  const rooms = await Room.findAll().catch((err) => console.error(err));
  return rooms;
};

const getTime = () => {
  const date = new Date();
  let hour = date.getHours();
  let time = "";
  if (hour > 12) {
    hour -= 12;
    time += "오후";
  } else time += "오전";

  time += ` ${hour}:${date.getMinutes()}`;
  return time;
};
