module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      userName: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      theme: { type: DataTypes.STRING, defaultValue: 'light' },
      userRole: { type: DataTypes.ENUM('admin', 'manager', 'user'), defaultValue: 'user' },
    },
    { tableName: 'users', timestamps: true, createdAt: 'createDate', updatedAt: 'updateDate' }
  );
  return User;
};
