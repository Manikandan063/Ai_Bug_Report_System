import * as userService from './user.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { createUserSchema, updateUserSchema } from './user.schema.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return sendResponse(res, 200, true, 'Users fetched successfully', users);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendResponse(res, 200, true, 'User fetched successfully', user);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    return sendResponse(res, 201, true, 'User created successfully', user);
  } catch (error) {
    if (error.errors) {
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 400, false, error.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, validatedData);
    return sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    if (error.errors) {
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 400, false, error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};