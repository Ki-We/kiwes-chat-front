module.exports = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "chatLog",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      room: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      user: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "chatLog",
    }
  );
};
