const Sequelize = require("sequelize");

const config = {
  host: "localhost",
  database: "socket",
  username: "user",
  password: "1234",
  dialect: "mysql",
};
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

module.exports = db;
