const { Room, User } = require("./model");
const { Chat } = require("./model2");
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
      notice: "",
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
router.post("/list", async (req, res) => {});

// 이전 삭제 필요 로직

router.post("/login", async (req, res) => {
  const user = await User.findOne({ where: { name: req.body.name } });
  if (user == null) {
    catch_error(null, res, "로그인 실패");
    return false;
  }

  const token = await createToken(user);
  res.send({ token });
});

router.get("/rooms", async (req, res) => {
  const rooms = await Room.findAll().catch((err) => console.error(err));
  res.send({ rooms });
});

module.exports = router;
