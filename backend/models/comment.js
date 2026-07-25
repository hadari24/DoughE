module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      commentId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      recipeId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER },
      text: { type: DataTypes.TEXT, allowNull: false },
      rating: { type: DataTypes.INTEGER }, // 1-5 stars, optional
    },
    { tableName: 'comments', timestamps: true, createdAt: 'createdAt', updatedAt: false }
  );
  return Comment;
};
