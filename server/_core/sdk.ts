import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import bcrypt from "bcryptjs";

type SessionPayload = {
  userId: number;
  username: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) return new Map<string, string>();
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(username: string, password: string, name?: string) {
    const existing = await db.getUserByUsername(username);
    if (existing) {
      throw new Error("用户名已存在");
    }
    const passwordHash = await this.hashPassword(password);
    await db.createUser({ username, passwordHash, name: name || username });
    return db.getUserByUsername(username);
  }

  async login(username: string, password: string): Promise<User> {
    const user = await db.getUserByUsername(username);
    if (!user) {
      throw new Error("用户名或密码错误");
    }
    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error("用户名或密码错误");
    }
    await db.updateUserLastSignedIn(user.id);
    return user;
  }

  async createSessionToken(
    userId: number,
    username: string,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({ userId, username })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) return null;

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { userId, username } = payload as Record<string, unknown>;

      if (!isNonEmptyString(username) || typeof userId !== "number") {
        return null;
      }

      return { userId, username };
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw new Error("Unauthorized");
    }

    const user = await db.getUserById(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export const sdk = new SDKServer();
