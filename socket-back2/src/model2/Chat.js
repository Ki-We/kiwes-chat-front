const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    roomID: {
      type: Number,
      required: true,
    },
    chat: {
      type: String,
      required: true,
    },
    notice: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
