import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { Role } from '../types/index.js';

export class AuthService {
  static async register(data: { name: string; email: string; password: string; role?: Role }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: passwordHash,
      role: data.role || Role.SALES_REP
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    return user;
  }
}
