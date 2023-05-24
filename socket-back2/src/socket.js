const { Room, Chat, User, ChatLog } = require("./model");

const catch_error = (err, socket, msg) => {
  console.error(err);
  console.log(`err : `, msg);
  socket.emit("error", { msg });
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
    });

    socket.on("nickname", async (info) => {
      const user = await User.findOne({ where: { name: info.nickname } });
      if (user == null) catch_error(null, socket, "로그인 실패");
      else nicknameList[socket.id] = info.nickname;

      const rooms = await getRooms(info.nickname);
      socket.emit("roomList", { rooms });
    });
    socket.on("createRoom", async (data) => {
      await Room.create(data).catch((err) => {
        catch_error(err, socket, "Failed:create room");
        return;
      });

      const rooms = await getRooms("");
      socket.emit("roomList", { rooms });
    });
    socket.on("enterRoom", async (data) => {
      if (nicknameList[socket.id] == undefined) {
        catch_error(null, socket, "닉네임 없이는 접근할 수 없습니다.");
        return;
      }
      socket.leave("lobby");

      socket.room = data.id;
      socket.join(data.id);

      if (await ChatLog.findOne({ where: { user: nicknameList[socket.id] } })) {
        await ChatLog.destroy({
          where: { user: nicknameList[socket.id], room: socket.room },
        });
      }
      const time = getTime();

      const initChat = { room_ID: data.id, chat: "[]" };
      const chatInfo = await Chat.findCreateFind({
        initChat,
        where: { room_ID: data.id },
      });
      const roomInfo = await Room.findOne({ where: { id: data.id } });
      const participants = JSON.parse(roomInfo.participants);
      const msgs = JSON.parse(chatInfo[0].chat);

      io.in(data.id).emit("msgList", msgs);

      if (!participants.includes(nicknameList[socket.id])) {
        io.in(data.id).emit("sendMsg", {
          writer: "system",
          msg: `${nicknameList[socket.id] || socket.id}님이 입장하셨습니다.`,
          time,
        });
        participants.push(nicknameList[socket.id]);
        await Room.update(
          { participants: JSON.stringify(participants) },
          { where: { id: data.id } }
        );
      }
      // 새로운 사용자 입장 ( 입장 목록 업데이트 )
      io.in(data.id).emit("participants", {
        master: roomInfo.master,
        participants,
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

    socket.on("dropout", async function (data) {
      const room = await Room.findOne({ where: { id: data.id } });
      if (room.master != nicknameList[socket.id]) {
        catch_error(null, socket, "강퇴는 방장만 가능합니다.");
        return false;
      }

      const origin = JSON.parse(room.participants);
      const participants = origin.filter((p) => p !== data.name);
      await Room.update(
        { participants: JSON.stringify(participants) },
        { where: { id: data.id } }
      );
      io.in(data.id).emit("dropout", { name: data.name });
    });

    socket.on("disconnect", async function () {
      // chatLog 에 추가
      console.log("--------------------------------------");
      console.log(socket.room);
      console.log(nicknameList[socket.id]);
      if (nicknameList[socket.id] != undefined) {
        const log = await ChatLog.findOne({
          where: { user: nicknameList[socket.id] },
        });
        if (socket.room != undefined && log == null) {
          await ChatLog.create({
            user: nicknameList[socket.id],
            room: socket.room,
          });
        }
      }

      console.log(socket.room);
      delete nicknameList[socket.id];
      console.log("Server Socket Disconnected");
    });
  });
};

const getRooms = async (user) => {
  const rooms = await Room.findAll().catch((err) => console.error(err));
  for await (const room of rooms) {
    room.dataValues["is_new"] = false;
    const chat = await Chat.findOne({ where: { room_ID: room.id } });
    const log = await ChatLog.findOne({ where: { room: room.id, user } });
    if (log != null && chat != null)
      room.dataValues["is_new"] = chat.updatedAt >= log.createdAt;
  }

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
