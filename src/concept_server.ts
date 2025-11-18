import { Hono } from "jsr:@hono/hono";
import { getDb } from "@utils/database.ts";
import { existsSync, walk } from "jsr:@std/fs";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { toFileUrl } from "jsr:@std/path/to-file-url";

import { setTaskConceptInstance } from "./syncs/task.sync.ts";

const flags = parseArgs(Deno.args, {
  string: ["port", "baseUrl"],
  default: { baseUrl: "/api" },
});

const PORT = Number(Deno.env.get("PORT")) ||
  parseInt(flags.port || "10000", 10);
const BASE_URL = flags.baseUrl;
const CONCEPTS_DIR = "src/concepts";

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

    const modulePath = toFileUrl(Deno.realPathSync(conceptFilePath)).href;
    const module = await import(modulePath);
    const ConceptClass = module.default;
    const instance = new ConceptClass(db);

    if (ConceptClass.name === "TaskConcept") {
      setTaskConceptInstance(instance);
    }

    instances[conceptName] = instance;
  }

  return instances;
}

async function main() {
  const [db] = await getDb();
  const app = new Hono();
  console.log(`Server running on port ${PORT}`);

  // --- CORS ---
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

  // DB test endpoint
  app.get("/ping-db", async (c) => {
    try {
      const [db] = await getDb();
      const colls = await db.listCollections().toArray();
      return c.json({ ok: true, collections: colls });
    } catch (e) {
      return c.json({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // --- Load Concepts ---
  console.log(`Scanning for concepts in ./${CONCEPTS_DIR}...`);

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

    if (!existsSync(conceptFilePath)) {
      console.warn(`⚠️ No concept file found for ${conceptName}, skipping.`);
      continue;
    }

    try {
      const modulePath = toFileUrl(Deno.realPathSync(conceptFilePath)).href;
      const module = await import(modulePath);
      const ConceptClass = module.default;

      if (
        typeof ConceptClass !== "function" ||
        !ConceptClass.name.endsWith("Concept")
      ) {
        console.warn(
          `⚠️ Invalid concept class in ${conceptFilePath}. Skipping.`,
        );
        continue;
      }

      const instance = new ConceptClass(db);

      // 🔥🔥🔥 IMPORTANT FIX: WIRE TASKCONCEPT INTO SYNCS
      if (ConceptClass.name === "TaskConcept") {
        console.log("🔗 Wiring TaskConcept to sync system...");
        setTaskConceptInstance(instance);
      }

      const conceptApiName = conceptName.charAt(0).toUpperCase() +
        conceptName.slice(1);

      console.log(
        `- Registering concept: ${conceptName} at ${BASE_URL}/${conceptApiName}`,
      );

      const methodNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(instance),
      ).filter(
        (name) =>
          name !== "constructor" && typeof instance[name] === "function",
      );

      for (const methodName of methodNames) {
        const route = `${BASE_URL}/${conceptApiName}/${methodName}`;
        app.post(route, async (c) => {
          try {
            const body = await c.req.json().catch(() => ({}));
            const result = await instance[methodName](body);
            return c.json(result);
          } catch (e) {
            console.error(`Error in ${conceptName}.${methodName}:`, e);
            return c.json({ error: "An internal server error occurred." }, 500);
          }
        });
        console.log(`  - Endpoint: POST ${route}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(
          `! Error loading concept from ${conceptFilePath}: ${e.message}`,
        );
      } else {
        console.error(
          `! Unknown error loading concept from ${conceptFilePath}:`,
          e,
        );
      }
    }
  }

  console.log(`\n✅ Server listening on http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, app.fetch);
}

main();
