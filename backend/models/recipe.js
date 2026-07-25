module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define(
    'Recipe',
    {
      recipeId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      doughFamily: { type: DataTypes.STRING, allowNull: false },
      hydration: { type: DataTypes.INTEGER },
      difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'easy' },
      totalTimeMinutes: { type: DataTypes.INTEGER },
      steps: { type: DataTypes.JSON },
      authorId: { type: DataTypes.INTEGER },
    },
    { tableName: 'recipes', timestamps: true, createdAt: 'createDate', updatedAt: 'updateDate' }
  );
  return Recipe;
};
