import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

// Dummy model to satisfy folder structure requirement
const Auth = sequelize.define('Auth', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'auth_tokens',
  timestamps: true,
});

export default Auth;