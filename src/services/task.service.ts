import mongoose from 'mongoose';
import { Task, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ActivityType } from '../types/index.js';

export class TaskService {
  static async getAll() {
    return Task.find()
      .sort({ createdAt: -1 })
      .populate('contact', 'id name')
      .populate('deal', 'id title');
  }

  static async create(data: {
    title: string;
    dueDate?: string;
    contactId?: string;
    dealId?: string;
    done?: boolean;
  }) {
    const validContactId = (data.contactId && mongoose.isValidObjectId(data.contactId)) ? data.contactId : null;
    const validDealId = (data.dealId && mongoose.isValidObjectId(data.dealId)) ? data.dealId : null;

    const task = await Task.create({
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      contactId: validContactId,
      dealId: validDealId,
      done: data.done || false
    });

    if (task.contactId || task.dealId) {
      await Activity.create({
        type: ActivityType.NOTE,
        summary: `Task scheduled: "${task.title}".`,
        contactId: task.contactId || null,
        dealId: task.dealId || null,
        timestamp: new Date()
      });
    }

    return Task.findById(task._id).populate('contact').populate('deal');
  }

  static async toggleDone(id: string) {
    const task = await Task.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }

    task.done = !task.done;
    await task.save();

    if (task.done) {
      await Activity.create({
        type: ActivityType.NOTE,
        summary: `Task marked completed: "${task.title}".`,
        contactId: task.contactId || null,
        dealId: task.dealId || null,
        timestamp: new Date()
      });
    }

    return Task.findById(task._id).populate('contact').populate('deal');
  }

  static async delete(id: string) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }

    return task;
  }
}
