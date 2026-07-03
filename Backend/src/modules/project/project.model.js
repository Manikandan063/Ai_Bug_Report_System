import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  deploymentUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE',
  }
}, {
  tableName: 'projects',
  timestamps: true,
});

export default Project;