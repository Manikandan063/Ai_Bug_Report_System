import * as authService from './auth.service.js';
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
};