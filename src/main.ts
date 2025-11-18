/**
 * Entry point for an application built with concepts + synchronizations.
 * Requires the Requesting concept as a bootstrap concept.
 * Please run "deno run import" or "generate_imports.ts" to prepare "@concepts".
 */
import * as concepts from "@concepts";
declare global {
  var __requestingServerStarted: boolean | undefined;
}

// Use the following line instead to run against the test database, which resets each time.
// import * as concepts from "@test-concepts";

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

// Start a server to provide the Requesting concept with external/system actions.
if (!globalThis.__requestingServerStarted) {
  await startRequestingServer(concepts);
} else {
  console.log("⚠️ Requesting server already active (skipping)");
}
