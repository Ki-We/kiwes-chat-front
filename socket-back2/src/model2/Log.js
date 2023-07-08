const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    room_ID: {
      type: Number,
      required: true,
    },
    user_ID: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
