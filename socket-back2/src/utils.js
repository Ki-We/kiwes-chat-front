const jwt = require("jsonwebtoken");

module.exports.catch_error = (err, res, msg) => {
  res.status(400).send({ msg });
  console.log(err);
};

module.exports.catch_error_socket = (err, socket, msg) => {
  console.error(err);
  console.log(`err : `, msg);
  socket.emit("error", { msg });
};

module.exports.createToken = (user) => {
  return jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);
};
module.exports.verifyToken = (token) => {
  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return {
      ok: true,
      ...decoded,
    };
  } catch (err) {
    const error = { ok: false };

    switch (err.name) {
      case "TokenExpiredError":
        error.code = 400;
        error.msg = "토큰이 만료되었습니다.";
        break;
      case "JsonWebTokenError":
        error.code = 400;
        error.msg = "토큰이 유효하지 않습니다.";
        break;
      default:
        error.code = 400;
        error.msg = "알 수 없는 문제가 발생했습니다.";
        break;
    }

    return error;
  }
};

module.exports.getTime = () => {
  const date = new Date();

  const month = changeFormatEach(date.getMonth() + 1);
  const day = changeFormatEach(date.getDate());
  const hour = changeFormatEach(date.getHours());
  const minute = changeFormatEach(date.getMinutes());

  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}`;
};
const changeFormatEach = (time) => {
  time = time >= 10 ? time : "0" + time;
  return time;
};
