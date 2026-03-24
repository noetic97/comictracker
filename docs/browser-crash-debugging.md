# Browser crash debugging (memory / WebKit / Firefox)

## Server-side log files

1. In project `.env` (same file systemd loads via `EnvironmentFile`):

   - `LOG_FILE=logs/comictracker.log` — duplicates everything the Node process prints to `console.*` into that file (journald still gets stdout/stderr).

   - `ENABLE_CLIENT_LOG_INGEST=true` — enables `POST /api/debug/client-log` so the SPA can upload diagnostic lines.

   - `CLIENT_LOG_FILE=logs/comictracker-client.log` — optional; if omitted, client payloads go to `LOG_FILE` when set, otherwise `logs/client-ingress.log`.

2. Rebuild/restart the app after changing env (e.g. `npm run build:prod:restart`).

3. Tail logs on the server:

   ```bash
   tail -f logs/comictracker.log
   tail -f logs/comictracker-client.log
   ```

## Client opt-in (so the browser POSTs to the server)

Either:

- Set `VITE_ENABLE_CLIENT_LOG=true` in the **repo-root** `.env` (Vite’s `envDir` is the project root) or under `client/.env*`, then **rebuild** production and deploy; or

- On the device, open the site, then in the console:

  ```js
  localStorage.setItem("comictracker_remote_log", "1");
  location.reload();
  ```

When enabled, the client mirrors `console.*`, `window.onerror`, unhandled rejections, visibility, and 60s heartbeats (`performance.memory` when available). **Warnings and errors** POST immediately and are **duplicated in `sessionStorage`** until the server returns success, so a hard crash can still leave a backlog to send on the next load. Low-priority `log`/`info`/heartbeats batch about every **25s**. On `pagehide` / `beforeunload`, up to **12** `sendBeacon` batches try to drain the queue.

**Note:** Mirroring can be noisy; disable ingest or clear `localStorage` / remove the env flag when you are done.

## iPhone (Safari / WebKit)

1. On the iPhone: **Settings → Safari → Advanced → Web Inspector** → On.

2. On a Mac: Safari → **Settings → Advanced** → enable **Show features for web developers** (menu **Develop** appears).

3. Connect the phone with USB (trust the computer).

4. On the Mac: **Develop → [your iPhone] → [page title]** — use **Console** and **Errors** to see JavaScript exceptions and network failures.

Firefox on iOS uses WebKit; deep remote inspection is still most reliable through Safari’s Web Inspector on the same page in Safari iOS, or by reproducing on **Firefox desktop** with **about:debugging** remote tabs if applicable.

## Firefox desktop

- **about:crashes** after a crash.

- **Ctrl+Shift+I** → Console / Performance / Memory while reproducing.

- Compare behavior with **private window** (extensions off) to rule out add-ons.
