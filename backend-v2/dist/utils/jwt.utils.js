"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const ACCESS_EXP = process.env.JWT_EXPIRATION || "60m";
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || "7d";
function signAccessToken(userId, username) {
    return jsonwebtoken_1.default.sign({ sub: userId, username }, ACCESS_SECRET, {
        expiresIn: ACCESS_EXP,
    });
}
function signRefreshToken(userId, username) {
    return jsonwebtoken_1.default.sign({ sub: userId, username }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXP,
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
    return decoded;
}
function verifyRefreshToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    return decoded;
}
