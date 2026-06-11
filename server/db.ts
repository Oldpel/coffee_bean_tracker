import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, coffeeBeansTable, brewingRecordsTable, CoffeeBean, BrewingRecord, InsertCoffeeBean, InsertBrewingRecord } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Coffee Beans Queries ============

export async function getUserCoffeeBeans(userId: number): Promise<CoffeeBean[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coffeeBeansTable).where(eq(coffeeBeansTable.userId, userId)).orderBy(desc(coffeeBeansTable.createdAt));
}

export async function getCoffeeBeanById(id: number, userId: number): Promise<CoffeeBean | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coffeeBeansTable).where(and(eq(coffeeBeansTable.id, id), eq(coffeeBeansTable.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCoffeeBean(bean: InsertCoffeeBean): Promise<CoffeeBean | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(coffeeBeansTable).values(bean);
  if (result[0].insertId) {
    const created = await getCoffeeBeanById(Number(result[0].insertId), bean.userId!);
    return created || null;
  }
  return null;
}

export async function updateCoffeeBean(id: number, userId: number, updates: Partial<InsertCoffeeBean>): Promise<CoffeeBean | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(coffeeBeansTable).set(updates).where(and(eq(coffeeBeansTable.id, id), eq(coffeeBeansTable.userId, userId)));
  const updated = await getCoffeeBeanById(id, userId);
  return updated || null;
}

export async function deleteCoffeeBean(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(coffeeBeansTable).where(and(eq(coffeeBeansTable.id, id), eq(coffeeBeansTable.userId, userId)));
  return result[0].affectedRows > 0;
}

// ============ Brewing Records Queries ============

export async function getBeanBrewingRecords(beanId: number, userId: number): Promise<BrewingRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brewingRecordsTable).where(and(eq(brewingRecordsTable.beanId, beanId), eq(brewingRecordsTable.userId, userId))).orderBy(desc(brewingRecordsTable.brewDate));
}

export async function getBrewingRecordById(id: number, userId: number): Promise<BrewingRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brewingRecordsTable).where(and(eq(brewingRecordsTable.id, id), eq(brewingRecordsTable.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBrewingRecord(record: InsertBrewingRecord): Promise<BrewingRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(brewingRecordsTable).values(record);
  if (result[0].insertId) {
    const created = await getBrewingRecordById(Number(result[0].insertId), record.userId!);
    return created || null;
  }
  return null;
}

export async function updateBrewingRecord(id: number, userId: number, updates: Partial<InsertBrewingRecord>): Promise<BrewingRecord | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(brewingRecordsTable).set(updates).where(and(eq(brewingRecordsTable.id, id), eq(brewingRecordsTable.userId, userId)));
  const updated = await getBrewingRecordById(id, userId);
  return updated || null;
}

export async function deleteBrewingRecord(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(brewingRecordsTable).where(and(eq(brewingRecordsTable.id, id), eq(brewingRecordsTable.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function getUserRecentBrewingRecords(userId: number, limit: number = 5): Promise<BrewingRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brewingRecordsTable).where(eq(brewingRecordsTable.userId, userId)).orderBy(desc(brewingRecordsTable.brewDate)).limit(limit);
}
