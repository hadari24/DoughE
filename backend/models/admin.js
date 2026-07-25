module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      adminId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      accessLevel: { type: DataTypes.STRING, defaultValue: 'standard' },
    },
    { tableName: 'admins', timestamps: true }
  );
  return Admin;
};
