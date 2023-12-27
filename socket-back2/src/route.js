const { Chat, Log } = require("./model2");
const { catch_error, getTime } = require("./utils");

const express = require("express");
const router = express.Router();
router.get("/test", (req,res) => {
  res.send("Success to connect test")
})
router.post("/room", async (req, res) => {
  const { clubId } = req.body;
  const chat = await Chat.findOne({ roomID: clubId });

  if (chat == null) {
    const data = {
      roomID: clubId,
      chat: "[]",
      notice: "[]",
    };
    const newChat = new Chat(data);
    try {
      await newChat.save();
      res.send({ msg: "create room" });
    } catch (err) {
      catch_error(err, res, "create room failed");
    }
  } else {
    res.send({ msg: "room is already created" });
  }
});
router.post("/list", async (req, res) => {
  const { userId } = req.body;

  const logs = await Log.find({ userId });

  for await (const log of logs) {
    log["is_new"] = false;
    const room = await Chat.findOne({ roomID: log.roomID });
    if (room != null) log["is_new"] = room.updatedAt <= log.createdAt;
  }
  res.send({ logs });
});
router.post("/permit", async (req, res) => {
  const { name, clubId } = req.body;

  try {
    const room = await Chat.findOne({ roomID: clubId });
    const chat = JSON.parse(room.chat);

    const msg = {
      userId: 0,
      msg: `${name} 님이 입장하셨습니다.`,
      time: getTime(),
    };

    chat.push(msg);
    room.chat = JSON.stringify(chat);
    await room.save();

    res.send({ msg: "Success permit" });
  } catch (err) {
    catch_error(err, res, "chatting server - permit user error");
  }
});

module.exports = router;
