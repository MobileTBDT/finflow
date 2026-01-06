import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const ACCESS_EXP = process.env.JWT_EXPIRATION || "60m";
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || "7d";

interface TokenPayload {
  sub: number;
  username: string;
}

export function signAccessToken(userId: number, username: string): string {
  return jwt.sign({ sub: userId, username }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: number, username: string): string {
  return jwt.sign({ sub: userId, username }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXP,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  return decoded as unknown as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  return decoded as unknown as TokenPayload;
}
