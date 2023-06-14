const { Room, Chat, User, ChatLog } = require("./model");
const { catch_error, createToken } = require("./utils");

const express = require("express");
const router = express.Router();

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
