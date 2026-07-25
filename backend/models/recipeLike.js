// junction table for the user <-> recipe "likes" many-to-many
module.exports = (sequelize, DataTypes) => {
  const RecipeLike = sequelize.define(
    'RecipeLike',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      recipeId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'recipe_likes', timestamps: true, createdAt: 'createdAt', updatedAt: false }
  );
  return RecipeLike;
};
