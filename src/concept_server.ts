import { Hono } from "jsr:@hono/hono";
import { getDb } from "@utils/database.ts";
import { existsSync, walk } from "jsr:@std/fs";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { toFileUrl } from "jsr:@std/path/to-file-url";

const flags = parseArgs(Deno.args, {
  string: ["port", "baseUrl"],
  default: { baseUrl: "/api" },
});

const PORT = Number(Deno.env.get("PORT")) ||
  parseInt(flags.port || "10000", 10);
const BASE_URL = flags.baseUrl;
const CONCEPTS_DIR = "src/concepts";

/** ----------------------------------------------------------
 *  Load all Concept classes and return instantiated objects
 * -------------------------------------------------------- */
export async function initConcepts(db: any) {
  const instances: Record<string, any> = {};

  for await (
    const entry of walk(CONCEPTS_DIR, {
      maxDepth: 1,
      includeDirs: true,
      includeFiles: false,
    })
  ) {
    if (entry.path === CONCEPTS_DIR) continue;

    const conceptName = entry.name;
    const conceptFilePath = `${entry.path}/${conceptName}Concept.ts`;
    if (!existsSync(conceptFilePath)) continue;

    try {
      const modulePath = toFileUrl(Deno.realPathSync(conceptFilePath)).href;
      const module = await import(modulePath);

      const ConceptClass = module.default;
      if (
        typeof ConceptClass !== "function" ||
        !ConceptClass.name.endsWith("Concept")
      ) {
        console.warn(
          `⚠️ Invalid ConceptClass in ${conceptFilePath}, skipping.`,
        );
        continue;
      }

      const instance = new ConceptClass(db);
      instances[conceptName] = instance;
    } catch (err) {
      console.error(
        `❌ Failed loading concept "${conceptName}":`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return instances;
}

/** ----------------------------------------------------------
 *  Main Server
 * -------------------------------------------------------- */
async function main() {
  const [db] = await getDb();
  const concepts = await initConcepts(db);

  const app = new Hono();
  console.log(`🚀 Server starting on port ${PORT}`);

  /** ---------------- CORS ---------------- */
  app.use("*", async (c, next) => {
    const origin = c.req.header("Origin") || "*";

    if (c.req.method === "OPTIONS") {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type");
      return c.text("OK", 200);
    }

    const res = await next();
    c.header("Access-Control-Allow-Origin", origin);
    return res;
  });

  /** ---------------- DB Test Endpoint ---------------- */
  app.get("/ping-db", async (c) => {
    try {
      const [db] = await getDb();
      const collections = await db.listCollections().toArray();
      return c.json({ ok: true, collections });
    } catch (err) {
      return c.json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  /** ---------------- Register Concept Routes ---------------- */
  console.log(`\n📦 Loading concepts from ./${CONCEPTS_DIR}`);

  for (const [conceptName, instance] of Object.entries(concepts)) {
    const conceptApiName = conceptName[0].toUpperCase() + conceptName.slice(1);
    const baseRoute = `${BASE_URL}/${conceptApiName}`;

    console.log(`\n- Concept: ${conceptName} → ${baseRoute}`);

    const methodNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(instance),
    ).filter((n) => n !== "constructor" && typeof instance[n] === "function");

    for (const methodName of methodNames) {
      const route = `${baseRoute}/${methodName}`;

      app.post(route, async (c) => {
        try {
          const body = await c.req.json().catch(() => ({}));
          const result = await instance[methodName](body);
          return c.json(result);
        } catch (err) {
          console.error(`❌ Error in ${conceptName}.${methodName}:`, err);
          return c.json({
            error: "Internal server error.",
          }, 500);
        }
      });

      console.log(`  ✔ POST ${route}`);
    }
  }

  console.log(`\n✅ Listening at http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, app.fetch);
}

//main();
