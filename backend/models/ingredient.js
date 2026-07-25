module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define(
    'Ingredient',
    {
      ingredientId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { tableName: 'ingredients', timestamps: false }
  );
  return Ingredient;
};
