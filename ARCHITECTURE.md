# Architecture Decisions

This document explains **WHY** Clawboard is built the way it is. For **WHAT** the rules are, see [CONTRACTS.md](./CONTRACTS.md).

Each decision includes what would make us change our mind. Architecture should evolve, not fossilize.

---

### Why Go instead of Node.js

**Decision:** Rewrite backend from Node.js/Express to Go at v2 (~2575 lines).

**Why:** Single binary deployment — no `node_modules`, no runtime dependency. 76ms cold start vs 520ms. 2.6MB RSS vs 186MB. Go's type system makes the schema architecture (validation, contracts) partially free — the compiler catches what Node.js tests had to catch. Rewriting at v2 costs days; at v6 it would cost months.

**Considered:** Keep Node.js (familiar, but growing pain with memory and startup), Rust (faster but harder for contributors), Deno/Bun (still JS ecosystem problems)

**Would change if:** Never. The rewrite is done and the benefits are permanent.

---

### Why Preact+HTM over Lit/Vanilla/React

**Decision:** Preact 10 + HTM 3 (~5KB vendored)

**Why:** Shadow DOM breaks Android WebView + Telegram Mini App. React is 40KB, Preact is 4KB with the same API. HTM = tagged templates, no JSX build step. AI agents write best React/Preact (most training data of any framework).

**Considered:** Vanilla JS (too limited for v3+ forms/CRUD), Lit (Shadow DOM breaks WebView), React (too heavy), Svelte (less AI training data, needs compiler)

**Would change if:** Preact stops being maintained, or a lighter framework with equal AI training coverage emerges.

---

### Why Go backend / ESM browser

**Decision:** Server-side = Go. ui.js = ESM (browser-native).

**Why:** Go handles all server logic as compiled code. Browsers are ESM-native for ui.js components. Clean separation — no module system confusion.

**Considered:** All-JS (Node ESM/CJS split is painful), WASM (too early)

**Would change if:** Never — Go + browser ESM is the cleanest split possible.

---

### Why panels are vertical slices

**Decision:** Each panel = folder with manifest.json + ui.js. Data handlers live in `internal/data/` (Go).

**Why:** AI agents can understand one folder completely without loading the whole codebase. Adding a panel's UI = adding a folder, no touching core. Each file has a single clear purpose. Data handlers in Go get type safety and compile-time checks.

**Considered:** Monolithic panels file, component library approach

**Would change if:** Panel count exceeds ~50 and discovery becomes slow (unlikely — lazy loading planned for v4).

---

### Why no build step

**Decision:** No webpack, no Vite, no bundler. ESM imports in browser, CJS in Node.

**Why:** AI agents can't reliably run build tools. Debugging bundled code is harder for both humans and AI. ESM imports work natively in all modern browsers. "Clone and run" — zero tooling required.

**Considered:** esbuild (fast but adds complexity), Vite (great DX but agents struggle with config)

**Would change if:** Browser ESM performance becomes a bottleneck with 50+ panels (would add optional bundling, never required).

---

### Why SQLite for v3 store

**Decision:** SQLite as default store, adapter pattern for alternatives.

**Why:** Zero setup — single file, excellent Go support via `modernc.org/sqlite` (pure Go, no CGO). Matches "single binary" philosophy. Adapter pattern means swap to PostgreSQL/MySQL without panel code changes.

**Considered:** PostgreSQL (overkill for single-user dashboards), JSON files (no queries), LevelDB (less familiar to AI agents)

**Would change if:** Multi-user concurrent writes become a requirement (v5 team features may need PostgreSQL adapter).

---

### Why hooks are all async

**Decision:** Hook engine is Go-native with goroutine-safe execution.

**Why:** Go's concurrency model (goroutines + channels) handles hook execution naturally. No event loop blocking concerns. Filter chains run sequentially for predictable ordering; actions can fire concurrently.

**Considered:** JS hook engine via embedded V8 (too complex), Lua scripting (another language to learn)

**Would change if:** Never. Go-native hooks are simpler and faster than any embedded scripting approach.

---

### Why cls() instead of CSS-in-JS or CSS modules

**Decision:** `cls('metric')` → `'p-cpu-metric'` — simple string prefix function.

**Why:** Zero runtime cost (just string concatenation). No build step needed. Predictable output — AI agents and humans can read the generated class names in DevTools. Namespace isolation without Shadow DOM.

**Considered:** CSS Modules (need bundler), styled-components (runtime overhead + build step), Shadow DOM (breaks WebView), BEM manual naming (error-prone, verbose)

**Would change if:** A zero-build CSS scoping solution with better DX emerges.

---

### Why validation rules as single source of truth

**Decision:** Panel validation rules in `internal/schema/panels.go` are the seed of the schema system — Clawboard's type system. Each validation check is a discrete function, designed for extraction into schema packages at v3.

**Why:** The docs audit found 21 issues, 7 critical. Root cause: documentation and code are separate artifacts describing the same truth. They drift. The solution: make validation rules in code the single source of truth. Multiple consumers (startup validation, doctor CLI, introspection API) read the same rules. Drift becomes architecturally impossible.

**Considered:**
- Doc linting tests (adds a third artifact to keep in sync — doesn't solve the root problem)
- Schema-as-documentation / enriched manifests (schema inflation — every concern bloats manifest.json into a mini-DSL)
- Template panel as documentation (becomes a god-panel trying to demonstrate everything)
- Declarative-first manifests (you're building a DSL in JSON — DSLs always grow)
- Delete docs, code is obvious (doesn't scale past v2's 400 lines to v6/ERP)

**Growth path:** v2 = Elm-quality errors in `internal/schema/panels.go`. v3 = extract to `internal/schema/` packages + doctor CLI. v4 = `/api/schema` introspection. v5-v6 = schema packages for roles, events, files. Each version adds a package. No version changes the architecture.

**Would change if:** The validation contract (`{ level, message, fix, ref }`) proves insufficient for a new concern that can't be expressed as "check state, return errors." We don't expect this — the contract is intentionally generic.

---

### Why capabilities field exists

**Decision:** Panels declare `capabilities: ["fetch"]` in manifest. Core validates against current version.

**Why:** Prevents "works on my machine" — a v3 panel needing `store` won't silently fail on v2. Forward-compatible: new capabilities added per version without breaking existing panels. Clear error messages at startup.

**Considered:** No validation (let it fail at runtime), version field only (too coarse — a panel might need store but not pages)

**Would change if:** Capability list exceeds ~10 items (would group into capability sets).
