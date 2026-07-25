// junction table for the recipes <-> ingredients many-to-many
module.exports = (sequelize, DataTypes) => {
  const RecipeIngredient = sequelize.define(
    'RecipeIngredient',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      recipeId: { type: DataTypes.INTEGER, allowNull: false },
      ingredientId: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.FLOAT },
      unit: { type: DataTypes.STRING },
    },
    { tableName: 'recipe_ingredients', timestamps: false }
  );
  return RecipeIngredient;
};
