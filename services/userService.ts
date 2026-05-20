import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import type { User } from '@prisma/client';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  address?: string | null;
  photo_profile?: string | null;
};

type LoginInput = {
  email: string;
  password: string;
};

type EditInput = {
  name?: string;
  email?: string;
  password?: string;
  address?: string | null;
  photo_profile?: string | null;
};

type AuthPayload = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
};

type ServiceError = Error & { statusCode?: number };

const createError = (message: string, statusCode: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.statusCode = statusCode;
  return error;
};

const toUserResponse = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  photo_profile: user.photoProfile,
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});

const signToken = (payload: AuthPayload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const registerUser = async (input: RegisterInput) => {
  const { name, email, password, address, photo_profile } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    throw createError('Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'USER',
      address: address ?? null,
      photoProfile: photo_profile ?? null,
    },
  });

  const payload: AuthPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const token = signToken(payload);

  return { token, user: toUserResponse(user) };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError('Invalid email or password', 401);
  }

  const payload: AuthPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const token = signToken(payload);

  return { token, user: toUserResponse(user) };
};

export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw createError('User not found', 404);
  }

  return toUserResponse(user);
};

export const editProfile = async (userId: number, input: EditInput) => {
  const { name, email, password, address, photo_profile } = input;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw createError('User not found', 404);
  }

  if (email && email !== userExists.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw createError('Email already exists', 409);
    }
  }

  const data: {
    name?: string;
    email?: string;
    address?: string | null;
    photoProfile?: string | null;
    password?: string;
  } = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (address !== undefined) data.address = address;
  if (photo_profile !== undefined) data.photoProfile = photo_profile;
  if (password) data.password = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return toUserResponse(updatedUser);
};
