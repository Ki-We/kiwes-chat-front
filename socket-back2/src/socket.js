const { Room, Chat, User, ChatLog, Sequelize } = require("./model");
const { verifyToken, catch_error_socket } = require("./utils");

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

    // 최초 socket 접속 = 나의 채팅방
    socket.on("entry", async (data) => {
      console.log(data.token);
      console.log(`${socket.id} entry`);

      const result = await verifyToken(data.token);
      if (!result.ok) {
        catch_error_socket(null, socket, result.msg);
        return;
      }

      /**
       * token이 유효할 때
       */
      // 1) 현재 접속자를 보여주는 nicknameList에 세팅
      nicknameList[socket.id] = result.name;

      // 2) 내가 접속해있는 방 가져오기
      const rooms = await Room.findAll({
        where: {
          [Sequelize.Op.or]: [
            {
              participants: {
                [Sequelize.Op.like]: `%"${result.name}"%`,
              },
            },
            {
              master: result.name,
            },
          ],
        },
      }).catch((err) => console.error(err));
      for await (const room of rooms) {
        room.dataValues["is_new"] = false;
        const chat = await Chat.findOne({ where: { room_ID: room.id } });
        const log = await ChatLog.findOne({
          where: { room: room.id, user: result.name },
        });
        log != null && console.log(log.createdAt);
        if (log != null && chat != null)
          room.dataValues["is_new"] = chat.updatedAt <= log.createdAt;
      }

      socket.emit("getMyRooms", { rooms });
    });

    socket.on("enterRoom", async (data) => {
      const result = await verifyToken(data.token);
      if (!result.ok) {
        catch_error_socket(null, socket, "로그인 한 사용자만 접근 가능합니다.");
        return;
      }
      // 이름 전달
      socket.emit("enterRoom", { name: result.name });
      nicknameList[socket.id] = result.name;
      socket.leave("lobby");

      socket.room = data.id;
      socket.join(data.id);

      if (await ChatLog.findOne({ where: { user: nicknameList[socket.id] } })) {
        await ChatLog.destroy({
          where: { user: nicknameList[socket.id], room: socket.room },
        });
      }
      const time = getTime();

      const initChat = { room_ID: parseInt(data.id), chat: "[]" };
      const chatInfo = await Chat.findCreateFind({
        initChat,
        where: { room_ID: parseInt(data.id) },
      });
      const roomInfo = await Room.findOne({ where: { id: parseInt(data.id) } });
      const participants = JSON.parse(roomInfo.participants);
      const msgs = JSON.parse(chatInfo[0].chat);

      io.in(data.id).emit("msgList", msgs);

      if (
        nicknameList[socket.id] != roomInfo.master &&
        !participants.includes(nicknameList[socket.id])
      ) {
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

      // 사용자 목록 전달
      io.in(data.id).emit("participants", {
        master: roomInfo.master,
        participants,
      });
      // 마스터에게만 Event 전달
      if (nicknameList[socket.id] == roomInfo.master) socket.emit("isMaster");

      if (roomInfo.notice != null)
        io.in(data.id).emit("notice", JSON.parse(roomInfo.notice));
    });
    socket.on("dropout", async function (data) {
      const result = await verifyToken(data.token);
      if (!result.ok) {
        catch_error_socket(null, socket, "로그인 한 사용자만 접근 가능합니다.");
        return;
      }

      const room = await Room.findOne({ where: { id: data.id } });
      if (room.master != result.name) {
        catch_error_socket(null, socket, "강퇴는 방장만 가능합니다.");
        return false;
      }

      const origin = JSON.parse(room.participants);
      const participants = origin.filter((p) => p !== data.name);
      await Room.update(
        { participants: JSON.stringify(participants) },
        { where: { id: data.id } }
      );
      io.in(data.id).emit("participants", {
        master: room.master,
        participants,
      });

      const time = getTime();
      io.to(data.id).emit("kickedout", data.name); // 특정 사용자에게만 안내
      io.in(data.id).emit("sendMsg", {
        writer: "system",
        msg: `${data.name}님이 강퇴당하셨습니다.`,
        time,
      });
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

    socket.on("disconnect", async function () {
      // chatLog 에 추가
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

      delete nicknameList[socket.id];
      console.log("Server Socket Disconnected");
    });
    /**
     * 실제 사용되지 않을 로직
     */
    socket.on("createRoom", async (data) => {
      const result = await verifyToken(data.token);
      if (!result.ok) {
        catch_error_socket(null, socket, result.msg);
        return;
      }

      /**
       * token이 유효할 때
       */
      data["master"] = result.name;
      const room = await Room.create(data).catch((err) => {
        catch_error_socket(err, socket, "Failed:create room");
        return;
      });

      await socket.emit("createNewRoom", { room });
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
