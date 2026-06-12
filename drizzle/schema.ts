import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 咖啡豆表：存储用户的咖啡豆信息
 */
export const coffeeBeansTable = mysqlTable("coffee_beans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 关联用户
  name: varchar("name", { length: 255 }).notNull(), // 豆子名称
  origin: varchar("origin", { length: 255 }), // 产地
  processingMethod: varchar("processingMethod", { length: 100 }), // 处理法（水洗/日晒/蜜处理等）
  roastLevel: varchar("roastLevel", { length: 50 }), // 烘焙度（浅/中浅/中/中深/深）
  purchaseDate: timestamp("purchaseDate").notNull(), // 入手日期
  notes: text("notes"), // 备注
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoffeeBean = typeof coffeeBeansTable.$inferSelect;
export type InsertCoffeeBean = typeof coffeeBeansTable.$inferInsert;

/**
 * 冲煮记录表：存储每次冲煮的详细数据
 */
export const brewingRecordsTable = mysqlTable("brewing_records", {
  id: int("id").autoincrement().primaryKey(),
  beanId: int("beanId").notNull(), // 关联咖啡豆
  userId: int("userId").notNull(), // 关联用户
  brewDate: timestamp("brewDate").notNull(), // 冲煮日期
  brewMethod: varchar("brewMethod", { length: 100 }), // 冲煮方式（手冲/摩卡壶/意式机等）
  waterTemperature: int("waterTemperature"), // 水温（摄氏度）
  grindSize: varchar("grindSize", { length: 100 }), // 研磨度（粗/中粗/中/中细/细等）
  coffeeAmount: decimal("coffeeAmount", { precision: 5, scale: 2 }), // 咖啡粉量（克）
  waterAmount: decimal("waterAmount", { precision: 5, scale: 2 }), // 水量（毫升）
  brewTime: int("brewTime"), // 冲煮时间（秒）
  tasteRating: int("tasteRating"), // 口感评分（1-10）
  notes: text("notes"), // 备注
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrewingRecord = typeof brewingRecordsTable.$inferSelect;
export type InsertBrewingRecord = typeof brewingRecordsTable.$inferInsert;

/**
 * 关系定义
 */
export const usersRelations = relations(users, ({ many }) => ({
  coffeeBeans: many(coffeeBeansTable),
  brewingRecords: many(brewingRecordsTable),
}));

export const coffeeBeansRelations = relations(coffeeBeansTable, ({ many, one }) => ({
  brewingRecords: many(brewingRecordsTable),
  user: one(users, {
    fields: [coffeeBeansTable.userId],
    references: [users.id],
  }),
}));

export const brewingRecordsRelations = relations(brewingRecordsTable, ({ one }) => ({
  coffeeBean: one(coffeeBeansTable, {
    fields: [brewingRecordsTable.beanId],
    references: [coffeeBeansTable.id],
  }),
  user: one(users, {
    fields: [brewingRecordsTable.userId],
    references: [users.id],
  }),
}));
