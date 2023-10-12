const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    roomID: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
