import jwt from "jsonwebtoken";
import { db } from "../../lib/db";
import config from "../../config/config";
import { validatePassword } from "../../lib/lib";
import { loginSchema } from "../../schemas/schemas";
import { COOKIE_NAME } from "../../constants/constants";
import { NextFunction, Request, RequestHandler, Response } from "express";

import {
  handleLoginAttempts,
  resetLoginAttempts,
  updateLoginAttempt,
} from "../../lib/handleLoginAttempts";

// Login
export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        isActive: true,
        role: true,
        name: true,
        email: true,
        loginAttempts: true,
        lastLoginAttempt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Simulate a delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!user || !user.password) {
      return invalidCredentials(res);
    }

    // Handle login attempts
    const isBlocked = await handleLoginAttempts(user, res);

    if (isBlocked) return;

    const validPassword = await validatePassword(password, user.password);

    if (!validPassword) {
      await updateLoginAttempt(user);
      return invalidCredentials(res);
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message:
          "Tu cuenta ha sido desactivada. Por favor, contacta al soporte para más información.",
      });
      return;
    }

    // Reset login attempts
    await resetLoginAttempts(user);

    const token = jwt.sign(
      { userId: user.id.toString(), role: user.role },
      config.JWT_SECRET_KEY,
      { expiresIn: "4h" }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 3600 * 1000, // 4 hours
      sameSite: "strict",
      path: "/",
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const invalidCredentials = (res: Response) => {
  res.status(401).json({
    success: false,
    message: "Credenciales inválidas",
  });
};

// Verify user
export const verify: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    const user = await db.user.findUnique({
      where: { id: req.user.userId.toString() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout: RequestHandler = (req, res) => {
  res
    .clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
    .status(200)
    .json({ success: true });
};