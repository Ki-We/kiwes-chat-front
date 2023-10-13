const { Chat, Log } = require("./model2");
const { getTime } = require("./utils");

const nicknameList = {};
module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", function (socket) {
    // --(1)-- 본인 방에서 빠져나와 lobby에 참여
    console.log(`${socket.id} connected`);
    socket.leave(socket.id);
    socket.join("lobby");
    // --(1)--
    // 3. 채팅 입장
    socket.on("enter", async (data) => {
      const { roomID, userId } = data;
      console.log(socket.rooms);

      console.log(`${userId} ${roomID} entry`);
      nicknameList[socket.id] = userId; // socket.id와 전달받은 userId 매핑

      socket.leave("lobby");
      socket.join(roomID);

      // 방 가져오기
      const room = await Chat.findOne({ roomID });

      if (room == null) {
        return socket.emit("error", {
          msg: "[Err01] enter. roomID 로 만들어진 채팅방이 존재하지 않습니다.",
        });
      }
      socket.emit("msgList", { chat: JSON.parse(room.chat) });
      socket.emit("notice", { notice: JSON.parse(room.notice) });
    });

    // 4. 채팅 진행
    socket.on("sendMSG", async (data) => {
      console.log(`${nicknameList[socket.id]} - ${socket.id}가 보냄`);
      console.log("socket.rooms : ", socket.rooms);
      console.log("현재 room 상황 io.rooms : ", io.sockets.adapter.rooms);
      const { msg, userId } = data;
      const content = {
        userId: userId,
        msg: msg,
        time: getTime(),
      };

      const currentRoom = getCurrentRoom(socket);
      const room = await Chat.findOne({ roomID: currentRoom });

      if (room == null) {
        return socket.emit("error", {
          msg: "[Err02] sendMSG. currentRoom에 해당하는 채팅방이 존재하지 않습니다.",
        });
      }

      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(currentRoom).emit("sendMSG", content);
    });

    // 4-1. 공지
    socket.on("notice", async (data) => {
      const { msg } = data;
      const content = {
        msg: msg,
        time: getTime(),
      };

      const currentRoom = getCurrentRoom(socket);
      const room = await Chat.findOne({ roomID: currentRoom });

      if (room == null) {
        socket.emit("error", {
          msg: "[Err03] notice. currentRoom에 해당하는 채팅방이 존재하지 않습니다.",
        });
        return;
      }

      room.notice = JSON.stringify(notice);
      await room.save();

      io.in(currentRoom).emit("notice", content);
    });

    // 5. 채팅방 나가기 ( 채팅 목록에서 나가기. 실제 퇴장 x )
    socket.on("leave", async (data) => {
      socket.leave(getCurrentRoom(socket));
      socket.join("lobby");
    });

    socket.on("kickedout", async (data) => {
      // 강퇴당했을 때

      console.log("-------kickedout------");
      const { name } = data;
      const content = {
        userId: 0, // userId 는 system을 의미
        msg: `${name} 님이 강퇴당하였습니다.`,
        time: getTime(),
      };
      const currentRoom = getCurrentRoom(socket);
      console.log(`currentRoom : ${currentRoom}`);

      const room = await Chat.findOne({ roomID: currentRoom });

      if (room == null) {
        return socket.emit("error", {
          msg: "[Err04] kickedOut. currentRoom에 해당하는 채팅방이 존재하지 않습니다.",
        });
      }

      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(currentRoom).emit("sendMSG", content);
    });
    socket.on("exit", async (data) => {
      const { name } = data;
      const content = {
        userId: 0,
        msg: `${name} 님이 퇴장하였습니다.`,
        time: getTime(),
      };
      const currentRoom = getCurrentRoom(socket);
      const room = await Chat.findOne({ roomID: currentRoom });

      if (room == null) {
        return socket.emit("error", {
          msg: "[Err05] exit. currentRoom에 해당하는 채팅방이 존재하지 않습니다.",
        });
      }

      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(currentRoom).emit("sendMSG", content);
    });

    socket.on("disconnect", async function () {
      // chatLog 에 추가
      console.log("-------disconnect------");
      console.log(
        `id : ${socket.id} nickname : ${nicknameList[socket.id]} disconnected`
      );
      if (nicknameList[socket.id] != undefined) {
        const log = await Log.findOne({ userId: nicknameList[socket.id] });
        const currentRoom = getCurrentRoom(socket);
        console.log(`currentRoom : ${currentRoom}`);

        if (currentRoom != undefined && log == null) {
          const data = {
            userId: nicknameList[socket.id],
            roomID: currentRoom,
          };
          const newLog = Log.create(data);
          try {
            await newLog.save();
          } catch (err) {
            console.log(err);
          }
        }
      }

      delete nicknameList[socket.id];
      console.log("Server Socket Disconnected");
    });
  });
};

const getCurrentRoom = (socket) => {
  return [...socket.rooms][0];
};
