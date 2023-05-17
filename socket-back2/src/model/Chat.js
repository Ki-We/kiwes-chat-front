module.exports = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "chat",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      chat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "chat",
    }
  );
};
