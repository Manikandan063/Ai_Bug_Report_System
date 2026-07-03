import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const BugReport = sequelize.define('BugReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  moduleName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bugDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  testDescription: {
    type: DataTypes.TEXT,
  },
  actualResult: {
    type: DataTypes.TEXT,
  },
  expectedResult: {
    type: DataTypes.TEXT,
  },
  severity: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Open', // Open, In Progress, Fixed, Closed
  },
  remarks: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'bug_reports',
  timestamps: true,
});

export default BugReport;