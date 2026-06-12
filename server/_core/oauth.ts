import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, password, name } = req.body as {
      username: string;
      password: string;
      name?: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: "用户名和密码不能为空" });
      return;
    }

    if (username.length < 3 || username.length > 32) {
      res.status(400).json({ error: "用户名长度需在 3-32 之间" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "密码长度至少 6 位" });
      return;
    }

    try {
      const user = await sdk.register(username, password, name);
      if (!user) {
        res.status(500).json({ error: "注册失败" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(user.id, user.username, {
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "注册失败" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: "用户名和密码不能为空" });
      return;
    }

    try {
      const user = await sdk.login(username, password);

      const sessionToken = await sdk.createSessionToken(user.id, user.username, {
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "登录失败" });
    }
  });
}
