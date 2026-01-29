import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "@/config/env";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

interface User {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const generateToken = (user: User, expiry: any) => {
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: expiry,
  });
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: User | null = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    delete user.password;

    const token = generateToken(user, "1m");
    const refreshToken = generateToken(user, "7d");

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        refresh_token: String(refreshToken),
      },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60000, // 1 minute
    });

    res.status(200).json({ message: "Sign in successful" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        refresh_token: "",
      },
    });


    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
    };

    const token = generateToken(userWithoutPassword, "1m");
    const refresh_token = generateToken(userWithoutPassword, "7d");

    await prisma.user.update({
      where: {
        id: userWithoutPassword.id,
      },
      data: {
        refresh_token: String(refresh_token),
      },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60000, // 1 minute
    });

    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
