const { Chat, Log } = require("./model2");
const { catch_error, createToken } = require("./utils");

const express = require("express");
const router = express.Router();

router.post("/room", async (req, res) => {
  const { roomID } = req.body;
  const chat = await Chat.findOne({ roomID });

  if (chat == null) {
    const data = {
      roomID,
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
  const { userID } = req.body;

  const logs = await Log.find({ userID });

  for await (const log of logs) {
    log["is_new"] = false;
    const room = await Chat.findOne({ roomID: log.roomID });
    if (room != null) log["is_new"] = room.updatedAt <= log.createdAt;
  }
  res.send({ logs });
});

module.exports = router;
