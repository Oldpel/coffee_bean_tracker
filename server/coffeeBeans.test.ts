import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    username: `test-user-${userId}`,
    passwordHash: "$2a$10$hash",
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Coffee Beans Router", () => {
  it("should create a coffee bean", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coffeeBeans.create({
      name: "Ethiopian Yirgacheffe",
      origin: "Ethiopia",
      processingMethod: "水洗",
      roastLevel: "中浅",
      purchaseDate: new Date(),
      notes: "Test bean",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Ethiopian Yirgacheffe");
    expect(result.userId).toBe(ctx.user.id);
  });

  it("should list coffee beans for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.coffeeBeans.create({
      name: "Test Bean 1",
      origin: "Colombia",
      processingMethod: "日晒",
      roastLevel: "中",
      purchaseDate: new Date(),
    });

    const beans = await caller.coffeeBeans.list();
    expect(Array.isArray(beans)).toBe(true);
    expect(beans.length).toBeGreaterThan(0);
  });

  it("should not allow access to other user's beans", async () => {
    const { ctx: ctx1 } = createAuthContext(1);
    const { ctx: ctx2 } = createAuthContext(2);

    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const bean = await caller1.coffeeBeans.create({
      name: "User 1 Bean",
      origin: "Kenya",
      processingMethod: "水洗",
      roastLevel: "中深",
      purchaseDate: new Date(),
    });

    try {
      await caller2.coffeeBeans.getById({ id: bean.id });
      expect.fail("Should not allow access to other user's bean");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});

describe("Brewing Records Router", () => {
  it("should create a brewing record", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const bean = await caller.coffeeBeans.create({
      name: "Test Bean for Brewing",
      origin: "Brazil",
      processingMethod: "蜜处理",
      roastLevel: "中",
      purchaseDate: new Date(),
    });

    const record = await caller.brewingRecords.create({
      beanId: bean.id,
      brewDate: new Date(),
      brewMethod: "手冲",
      waterTemperature: 92,
      grindSize: "中细",
      coffeeAmount: 15,
      waterAmount: 250,
      brewTime: 180,
      tasteRating: 8,
      notes: "Good balance",
    });

    expect(record).toBeDefined();
    expect(record.beanId).toBe(bean.id);
    expect(record.tasteRating).toBe(8);
  });

  it("should list brewing records for a bean", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const bean = await caller.coffeeBeans.create({
      name: "Test Bean",
      origin: "Vietnam",
      processingMethod: "水洗",
      roastLevel: "深",
      purchaseDate: new Date(),
    });

    await caller.brewingRecords.create({
      beanId: bean.id,
      brewDate: new Date(),
      brewMethod: "摩卡壶",
      tasteRating: 7,
    });

    await caller.brewingRecords.create({
      beanId: bean.id,
      brewDate: new Date(),
      brewMethod: "意式机",
      tasteRating: 8,
    });

    const records = await caller.brewingRecords.listByBean({ beanId: bean.id });
    expect(records.length).toBe(2);
  });

  it("should not allow creating record for other user's bean", async () => {
    const { ctx: ctx1 } = createAuthContext(1);
    const { ctx: ctx2 } = createAuthContext(2);

    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const bean = await caller1.coffeeBeans.create({
      name: "User 1 Bean",
      origin: "Peru",
      processingMethod: "水洗",
      roastLevel: "中浅",
      purchaseDate: new Date(),
    });

    try {
      await caller2.brewingRecords.create({
        beanId: bean.id,
        brewDate: new Date(),
        brewMethod: "手冲",
      });
      expect.fail("Should not allow creating record for other user's bean");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});
