/**
 * Entry point for an application built with concepts + synchronizations.
 * Requires the Requesting concept as a bootstrap concept.
 */
import * as concepts from "@concepts";
declare global {
  var __requestingServerStarted: boolean | undefined;
}

const { Engine } = concepts;
import { Logging } from "@engine";
import { startRequestingServer } from "@concepts/Requesting/RequestingConcept.ts";
import syncs from "@syncs";
import { initConcepts } from "./concept_server.ts";
import { getDb } from "@utils/database.ts";

/**
 * Available logging levels:
 *   Logging.OFF
 *   Logging.TRACE - display a trace of the actions.
 *   Logging.VERBOSE - display full record of synchronization.
 */
const [db] = await getDb();
await initConcepts(db); // Ensure TaskConcept is set

Engine.register(syncs);
Engine.logging = Logging.TRACE;

// Determine port for Render or fallback to 10000 for local dev
// Set the PORT for Render
const port = Number(Deno.env.get("PORT")) || 10000;
Deno.env.set("PORT", port.toString());

// Start server normally
if (!globalThis.__requestingServerStarted) {
  await startRequestingServer(concepts); // only one argument
  console.log(`🚀 Server listening on port ${port}`);
} else {
  console.log("⚠️ Requesting server already active (skipping)");
}
