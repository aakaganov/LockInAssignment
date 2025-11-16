import { getDb } from "/Users/annakaganov/LockInAssignment/src/utils/database.ts";

async function test() {
  try {
    const [db] = await getDb();
    const collections = await db.listCollections().toArray();
    console.log("MongoDB collections:", collections.map((c) => c.name));
  } catch (e) {
    console.error("MongoDB connection failed:", e);
  }
}

test();
