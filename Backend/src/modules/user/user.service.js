import User from './user.model.js';
import { hashPassword } from '../../shared/utils/bcrypt.js';

export const getAllUsers = async () => {
  return await User.findAll({ attributes: { exclude: ['password'] } });
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('User not found');
  return user;
};

export const createUser = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await hashPassword(userData.password);
  const newUser = await User.create({ ...userData, password: hashedPassword });
  
  const userWithoutPassword = newUser.toJSON();
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');

  if (updateData.email && updateData.email !== user.email) {
    const existing = await User.findOne({ where: { email: updateData.email } });
    if (existing) throw new Error('Email is already taken');
  }

  await user.update(updateData);
  const updatedUser = user.toJSON();
  delete updatedUser.password;
  return updatedUser;
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
  return { id };
};