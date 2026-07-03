import fs from 'fs';
import path from 'path';

const files = {
  'package.json': `{
  "name": "ai-bug-report-backend",
  "version": "1.0.0",
  "description": "Backend for AI Bug Report System",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/scripts/seed.js"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "exceljs": "^4.4.0",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.5",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.37.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
  '.env.example': `PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/bug_report_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
GEMINI_API_KEY=your_gemini_api_key`,
  'src/config/db.js': `import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/bug_report_db', {
  dialect: 'postgres',
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;`,
  'src/models/initModels.js': `import sequelize from '../config/db.js';
import User from '../modules/user/user.model.js';
import Auth from '../modules/auth/auth.model.js';

export const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

export { User, Auth };`,
  'src/shared/utils/response.js': `export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};`,
  'src/shared/utils/bcrypt.js': `import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};`,
  'src/shared/utils/jwt.js': `import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};`,
  'src/modules/user/user.model.js': `import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'TESTER', 'DEVELOPER'),
    allowNull: false,
    defaultValue: 'TESTER',
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'users',
  timestamps: true,
});

export default User;`,
  'src/modules/auth/auth.model.js': `import { DataTypes } from 'sequelize';
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

export default Auth;`,
  'src/modules/auth/auth.schema.js': `import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'TESTER', 'DEVELOPER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});`,
  'src/modules/auth/auth.service.js': `import User from '../user/user.model.js';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.js';
import { generateToken } from '../../shared/utils/jwt.js';

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(userData.password);
  
  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
  });

  const userWithoutPassword = newUser.toJSON();
  delete userWithoutPassword.password;

  return userWithoutPassword;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (!user.status) {
    throw new Error('User account is disabled');
  }

  const token = generateToken({ id: user.id, role: user.role });

  const userWithoutPassword = user.toJSON();
  delete userWithoutPassword.password;

  return { user: userWithoutPassword, token };
};`,
  'src/modules/auth/auth.controller.js': `import * as authService from './auth.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { registerSchema, loginSchema } from './auth.schema.js';

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    return sendResponse(res, 201, true, 'User registered successfully', user);
  } catch (error) {
    if (error.errors) {
      // Zod validation errors
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 400, false, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const data = await authService.loginUser(validatedData.email, validatedData.password);
    return sendResponse(res, 200, true, 'Login successful', data);
  } catch (error) {
    if (error.errors) {
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 401, false, error.message);
  }
};`,
  'src/modules/auth/auth.routes.js': `import { Router } from 'express';
import { register, login } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('c:\\\\Ai_Bug_Report', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + fullPath);
}
