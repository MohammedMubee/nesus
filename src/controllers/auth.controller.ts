import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  res.status(201).json(ApiResponse.created(result, 'User registered successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.status(200).json(ApiResponse.ok(result, 'Login successful'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await AuthService.getProfile(req.user.id);
  res.status(200).json(ApiResponse.ok(user, 'User profile retrieved'));
});

