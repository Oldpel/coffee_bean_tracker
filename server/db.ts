import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, coffeeBeansTable, brewingRecordsTable, CoffeeBean, BrewingRecord, InsertCoffeeBean, InsertBrewingRecord } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function createUser(user: { username: string; passwordHash: string; name?: string | null }): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return;
  }
  await db.insert(users).values({
    username: user.username,
    passwordHash: user.passwordHash,
    name: user.name || null,
  });
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
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
