const { DataTypes, Model } = require("sequelize");

const sequelize = require("../util/DBConn");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = User;
