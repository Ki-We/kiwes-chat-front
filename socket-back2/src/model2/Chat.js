const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    chat: {
      type: String,
      required: true,
    },
    room_ID: {
      type: Number,
      required: true,
    },
    notice: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
