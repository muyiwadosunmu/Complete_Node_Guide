const { DataTypes, Model } = require("sequelize");

const sequelize = require("../util/DBConn");

const CartItem = sequelize.define("Cart", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
});

module.exports = CartItem;
