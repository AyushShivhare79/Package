import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT secret is not defined");
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
