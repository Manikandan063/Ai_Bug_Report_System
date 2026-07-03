import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ProjectAssignment = sequelize.define('ProjectAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleInProject: {
    type: DataTypes.ENUM('TESTER', 'DEVELOPER'),
    allowNull: false,
  }
}, {
  tableName: 'project_assignments',
  timestamps: true,
});

export default ProjectAssignment;