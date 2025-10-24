## Quick orientation — what this repo is

This project is a set of example "concepts" implemented in TypeScript using
Deno and MongoDB. The runtime entrypoint is `src/concept_server.ts`, which
dynamically loads concept classes from `src/concepts/*` and exposes each public
method as a POST endpoint under `/api/<ConceptName>/<method>`.

Key folders:
- `src/concepts/` — each subfolder (e.g. `LikertSurvey`, `OgProject`) contains
  a `<Name>Concept.ts` that exports a default class whose methods are the
  concept actions/queries.
- `src/utils/` — helpers for DB initialization, types, and IDs (`database.ts`,
  `types.ts`).
- `docs/` and `design/` — API specs and design docs. `docs/api-spec.md` shows
  the intended HTTP endpoints and payload shapes.

Quick mental model:
- Each Concept class receives a `Db` (MongoDB) instance in its constructor.
- The server scans `src/concepts` at startup, instantiates each concept, then
  registers a POST route for every instance method (except constructor). The
  route handler parses JSON (or empty body) and forwards it to the method.

How to run and test locally
- Recommended runtime: Deno. See `deno.json` imports and `tasks.concepts` for
  the suggested command. The server is run like:

  deno run --allow-net --allow-read --allow-env --allow-run src/concept_server.ts --port 8000 --baseUrl /api

- Tests are Deno tests. Run all tests with full permissions when using local
  MongoDB Atlas credentials:

  deno test -A

Project-specific conventions
- Concept filenames: `<ConceptName>Concept.ts`. The exported default must be a
  class whose name ends with `Concept` (server checks this convention).
- Collections are namespaced by a `PREFIX` within concept files (example:
  `LikertSurvey.`) to avoid cross-concept collisions.
- Methods returning errors use the shape `{ error: string }`. Successful
  responses usually return either `{ <idName>: id }` or `{}` for empty success.
- Internal helper/query methods are prefixed with `_` (e.g. `_getSurveyQuestions`).

Common troubleshooting notes for agents
- If a new concept fails to load, check `src/concepts/<Name>/<Name>Concept.ts`
  for the default export and class name. The server logs which file failed and
  the exception.
- For DB issues: `src/utils/database.ts` reads `MONGODB_URL` and `DB_NAME` from
  env. In tests the repo uses `test-<DB_NAME>` and drops collections before
  running tests (see `testDb()`).
- When adding endpoints, remember the server only registers instance methods on
  creation — static or top-level exported functions are ignored.

Examples to reference when implementing features
- Dynamic routing: `src/concept_server.ts` — shows how routes are created from
  Concept instance methods and how requests are forwarded.
- DB helpers: `src/utils/database.ts` — shows `getDb()`, `testDb()`, and
  `freshID()` usage for UUID v7 IDs.
- Concept pattern: `src/concepts/LikertSurvey/LikertSurveyConcept.ts` — shows
  collection naming, input validation, error return shapes, and helper
  methods for queries.

Edge cases and patterns AI should follow
- Preserve collection name prefixes and typed collection usage to avoid
  interfering with other concepts during tests.
- Prefer returning error objects `{ error: string }` instead of throwing for
  business-validation failures (server converts exceptions to a generic 500
  JSON error message).
- Keep methods idempotent where appropriate: creation methods should generate
  an ID via `freshID()` and insert; update methods should check for existence
  and return a descriptive error if the target doesn't exist.

When to run tests vs. run server
- Use `deno test -A` for unit tests and concept integration tests (they expect
  a reachable MongoDB configured in `.env`). Use the server command above for
  manual API exploration.

If you edit docs or design files
- The `context/` directory is an immutable history used by the Context tool.
  Do not modify `context/` files directly — instead edit the source Markdown in
  `design/` or `docs/` and use the `ctx` tool described in `README.md` to save
  or prompt.

Last line: If anything here is unclear, leave a concise comment in the PR with
the file path you inspected and the change you want; I'll iterate on these
instructions.
