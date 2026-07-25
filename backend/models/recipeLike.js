// junction table for the user <-> recipe "likes" many-to-many.
// Also carries the user's personal note for that saved recipe.
module.exports = (sequelize, DataTypes) => {
  const RecipeLike = sequelize.define(
    'RecipeLike',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      recipeId: { type: DataTypes.INTEGER, allowNull: false },
      note: { type: DataTypes.TEXT },
    },
    { tableName: 'recipe_likes', timestamps: true, createdAt: 'createdAt', updatedAt: false }
  );
  return RecipeLike;
};
