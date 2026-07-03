import User from '../user/user.model.js';
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
};