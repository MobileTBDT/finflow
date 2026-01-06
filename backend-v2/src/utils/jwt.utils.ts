import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const ACCESS_EXP = process.env.JWT_EXPIRATION || "60m";
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || "7d";

export function signAccessToken(userId: number, username: string) {
  return jwt.sign({ sub: userId, username }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP,
  });
}

export function signRefreshToken(userId: number, username: string) {
  return jwt.sign({ sub: userId, username }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXP,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as { sub: number; username: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as {
    sub: number;
    username: string;
  };
}
