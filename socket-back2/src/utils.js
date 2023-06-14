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
        error.code = cst.ERRORCODE_EXPIRED;
        error.msg = cst.ERRORMSG_TOKENEXPIRED;
        break;
      case "JsonWebTokenError":
        error.code = cst.ERRORCODE_UNAUTHORIZED;
        error.msg = cst.ERRORMSG_WRONGTOKEN;
        break;
      default:
        error.code = cst.ERRORCODE_BAD_REQUEST;
        error.msg = cst.ERRORMSG_UNKNOWN;
        break;
    }

    return error;
  }
};
