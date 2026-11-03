<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:dev-server-rules -->
# Dev Server & Long-Running Command Rules

These rules exist because repeated `next dev` spawns and long polling loops
have caused multi-GB RAM growth and system freezes.

## Dev server

- **Kill before start.** Always terminate any existing dev server before
  starting a new one. Never start a second instance on a new port to work
  around `EADDRINUSE`.
- **One fixed port.** Use port `3000` (or the port already recorded in
  `dev.log`). Do not increment ports (`3113`, `3131`, `3141`, ...). A port
  collision means an old server is alive — kill it, do not hop ports.
- **Prefer `npm run dev`** over `npx next dev`. `npx` adds an extra wrapper
  process per invocation and re-resolves the registry each time.
- **Start it once per session,** then verify with a single `curl` against
  `http://localhost:3000`. Do not restart it after every file edit;
  hot reload already handles that.
- **Report the PID** when you start a server so it can be stopped later.

## Polling and waits

- **Never** use `for i in $(seq 1 30); do sleep 20; curl ...; done`. That is
  10+ minutes of blocking shell time with output buffered in memory.
- Use at most **6 attempts with a 3s delay** (max ~20s total):
  `for i in 1 2 3 4 5 6; do curl -sf -m 3 URL && break; sleep 3; done`
- Add `-m` (max time) to every `curl`. Never allow an unbounded `curl`.
- Prefer a single bounded check over a retry loop when possible.

## Cleanup

- Before finishing a task, stop any dev server or watch process you started.
- If you opened browser tabs for verification, close them when done.
<!-- END:dev-server-rules -->
