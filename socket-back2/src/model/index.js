const Sequelize = require("sequelize");

const config = require("../config/config.json")[process.env.DB_MODE || "local"];
const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Room = require("./Room")(sequelize, Sequelize);
db.Chat = require("./Chat")(sequelize, Sequelize);
db.ChatLog = require("./ChatLog")(sequelize, Sequelize);
db.User = require("./User")(sequelize, Sequelize);

db.Room.hasOne(db.Chat, {
  foreignKey: "room_ID",
  sourceKey: "id",
  onDelete: "cascade",
});
db.Chat.belongsTo(db.Room, {
  foreignKey: "id",
  sourceKey: "room_ID",
  onDelete: "cascade",
});

module.exports = db;
