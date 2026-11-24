import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { TaskService } from '../services/task.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getTasks = asyncHandler(async (_req: Request, res: Response) => {
  const tasks = await TaskService.getAll();
  res.status(200).json(ApiResponse.ok(tasks));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskService.create(req.body);
  res.status(201).json(ApiResponse.created(task, 'Task created successfully'));
});

export const toggleTaskDone = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskService.toggleDone(String(req.params.id));
  res.status(200).json(ApiResponse.ok(task, 'Task status toggled'));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await TaskService.delete(String(req.params.id));
  res.status(200).json(ApiResponse.ok(null, 'Task deleted successfully'));
});
