const { Chat, Log } = require("./model2");
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
    console.log(`${socket.id} connected`);
    socket.leave(socket.id);
    socket.join("lobby");
    // --(1)--

    // 최종 로직
    // 기타 - 관리자 승인
    socket.on("permit", async (data) => {
      // 관리자가 승인할 시 해당 채팅방에 system 메세지 추가 필요
      // {roomID: number, user:string}
      const { roomID, user } = data;
      const room = await Chat.findOne({ roomID });
      const chat = JSON.parse(room.chat);

      socket.room = roomID;
      socket.join(roomID);

      const msg = {
        writer: "system",
        msg: `${user} 님이 입장하셨습니다.`,
        time: getTime(),
      };
      io.in(roomID).emit("sendMSG", msg);
      chat.push(msg);
      room.chat = JSON.stringify(chat);
      await room.save();
    });
    // 3. 채팅 입장
    socket.on("enter", async (data) => {
      const { roomID, userID } = data;

      console.log(`${userID} ${roomID} entry`);
      nicknameList[socket.id] = userID; // socket.id와 전달받은 userID 매핑

      console.log(getCurrentRoom(socket));
      socket.leave("lobby");
      socket.join(roomID);

      // 방 가져오기
      const room = await Chat.findOne({ roomID });
      const chat = JSON.parse(room.chat);

      socket.emit("msgList", chat);
    });

    // 4. 채팅 진행
    socket.on("sendMSG", async (data) => {
      const { msg, name } = data;
      const content = {
        writer: name,
        msg: msg,
        time: getTime(),
      };
      const room = await Chat.findOne({ roomID: socket.room });
      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(socket.room).emit("sendMSG", content);
    });

    // 5. 채팅방 나가기 ( 채팅 목록에서 나가기. 실제 퇴장 x )
    socket.on("leave", async (data) => {
      socket.leave(socket.room);
      socket.join("lobby");
    });

    socket.on("kickedout", async (data) => {
      // 강퇴당했을 때
      const { name } = data;
      const content = {
        writer: "system",
        msg: `${name} 님이 강퇴당하였습니다.`,
        time: getTime(),
      };
      const room = await Chat.findOne({ roomID: socket.room });
      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(socket.room).emit("sendMSG", content);
    });
    socket.on("exit", async (data) => {
      // 자진 모임에 불참하기를 눌렀을 때 ( 스스로 나가기 )
      const { name } = data;
      const content = {
        writer: "system",
        msg: `${name} 님이 퇴장하였습니다.`,
        time: getTime(),
      };
      const room = await Chat.findOne({ roomID: socket.room });
      const chat = JSON.parse(room.chat);
      chat.push(content);
      room.chat = JSON.stringify(chat);
      await room.save();

      io.in(socket.room).emit("sendMSG", content);
    });

    socket.on("disconnect", async function () {
      // chatLog 에 추가
      if (nicknameList[socket.id] != undefined) {
        const log = await Log.findOne({ userID: nicknameList[socket.id] });

        if (socket.room != undefined && log == null) {
          const data = {
            userID: nicknameList[socket.id],
            roomID: socket.room,
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

const getCurrentRoom = (socket) => {
  let currentRoom = "";
  let socketRooms = Object.keys(socket.rooms);
  for (let i = 0; i < socketRooms.length; i++) {
    if (socketRooms[i].indexOf("Room_") !== -1) {
      currentRoom = socketRooms[i];
      break;
    }
  }
  return currentRoom;
};
