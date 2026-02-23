# Comic Tracker

Comic Tracker is a web application designed to help comic book enthusiasts manage their want list and collection. Built with modern web technologies, it offers a user-friendly interface for tracking, sorting, and filtering your comic book inventory.

## Features

- Import comic data from CSV files
- Filter and sort comics by various criteria
- Mark comics as collected
- Responsive design for desktop and mobile use
- Offline capability with Progressive Web App (PWA) support

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Vite (for fast development and building)
  - Styled Components (for styling)
- **State Management:**
  - React Hooks (useState, useEffect, useMemo)
- **Backend:**
  - Node.js + Express (API server)
  - Prisma + SQLite (database)
- **Data Persistence:**
  - SQLite (via Prisma); optional IndexedDB for offline
- **CSV Parsing:**
  - PapaParse
- **Icons:**
  - Lucide React
- **Progressive Web App:**
  - Custom Service Worker

## Authentication and data access

The app is **single-tenant** with one default user. There is no Row Level Security; all API operations are scoped to that user in application code.

- **Default user:** Created automatically from `DEFAULT_USER_EMAIL` (env or `user@comictracker.local`). See `functions/utils/db.ts` (`ensureDefaultUser`).
- **Database:** SQLite via Prisma (no Supabase or Postgres).
- For multi-user later, add auth (e.g. JWT) and pass `userId` from the token; services already take `userId` for all queries.

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- npm (v10 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/comictracker.git
   cd comictracker
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the database (optional; defaults to `file:./prisma/dev-comics.db`):

   ```
   # .env (optional)
   DATABASE_URL="file:./prisma/dev-comics.db"
   DEFAULT_USER_EMAIL="user@comictracker.local"
   ```
   For production use a different file (e.g. `file:./prisma/prod-comics.db`) and set `DATABASE_URL` accordingly.  
   **If you had a DB at `prisma/prisma/dev.db`:** it has been copied to `prisma/dev-comics.db`. After confirming the app works, you can delete the `prisma/prisma` folder.

4. Run database migrations (creates SQLite DB if needed):

   ```
   npx prisma migrate deploy
   ```

5. Start the development server (client on port 3000, API on port 3001):

   ```
   npm run dev
   ```

6. Open your browser at `http://localhost:3000`. The client proxies `/api` to the Node server.

## Building for Production

Build the client and run the server locally:

```
npm run build          # builds client to client/dist
npm run start          # runs API + static server on PORT (default 3001)
```

Serve the app at `http://localhost:3001` (or set `PORT`). The server serves the SPA from `client/dist` and the API at `/api`.

**Build output:** Only `client/dist` is used (Vite’s output). A root `dist/` folder is not used; you can delete it if present.

## Exposing with nginx + DuckDNS (optional)

To access the app outside your network:

1. Run the app (e.g. `npm run start`) on a host.
2. Point [DuckDNS](https://www.duckdns.org/) at your public IP.
3. Configure nginx as a reverse proxy to `http://127.0.0.1:3001` (or your `PORT`).
4. Use HTTPS (e.g. Let's Encrypt) if desired. No code changes required.

## GitHub Actions

- **Health Monitor** (`.github/workflows/health-monitor.yml`): Optional. Runs on a schedule and pings your deployed `/api/health` if you set the `HEALTH_URL` repo secret (e.g. `https://your-duckdns.example.com/api/health`). Optionally set `ALERT_URL` to POST alerts on failure. If neither secret is set, the job is skipped.
- **Schema drift check**: Removed; it was for comparing against remote Supabase/Postgres. With SQLite + Prisma, the source of truth is `prisma/schema.prisma` and migrations in the repo. Use `npm run db:check-drift` locally against a DB if needed.

## Usage

1. **Importing Comics:**

   - Click the menu icon in the top right corner.
   - Select "Upload..." and choose a CSV file with your comic data.

2. **Filtering and Sorting:**

   - Use the filter icon to open the filter/sort panel.
   - Enter text to filter comics by series or publisher.
   - Select a sort option from the dropdown menu.

3. **Marking as Collected:**

   - Click the "Mark as Collected" button on any comic to update its status.

4. **Expanding/Collapsing Series:**
   - Click on a series name to expand or collapse its issues.
   - Use the "Expand All" or "Collapse All" button to change all series at once.

## Debugging and Logging

Comic Tracker includes robust debugging and logging utilities to help with development and troubleshooting.

### Logger Utility

The application uses a functional logging system with level-based filtering and contextual logging.

#### Log Levels

- **`debug`** - Detailed information for debugging (hidden in production by default)
- **`info`** - General information about application flow
- **`warn`** - Warning messages about potential issues
- **`error`** - Error messages for failures and exceptions

#### Usage in Browser Console

```javascript
// Enable debug mode to see all log levels
enableDebugMode();

// Disable debug mode (back to info/warn/error only)
disableDebugMode();
```

#### Environment Configuration

Set logging level via environment variable:

```bash
# .env file
VITE_LOG_LEVEL=debug  # or info, warn, error, silent
```

#### Development vs Production

- **Development**: Debug mode enabled by default, shows all logs
- **Production**: Only shows `info`, `warn`, and `error` logs by default
- **Runtime Control**: Use console commands to toggle debug mode without rebuilding

#### Contextual Loggers

The logger provides contextual logging for different application areas:

- **`logger.comics.*`** - Comic-related operations (create, update, collect, grail)
- **`logger.stats.*`** - Statistics and aggregation operations
- **`logger.api.*`** - API requests and responses
- **`logger.import.*`** - CSV import and data processing

### API Debugger

For detailed API request/response debugging and analysis.

#### Browser Console Commands

```javascript
// Enable API call tracking and detailed logging
apiDebugger.enable();

// Disable API debugging
apiDebugger.disable();

// View recent API calls (last 10)
apiDebugger.getCalls();

// View only failed API calls
apiDebugger.getFailedCalls();

// Clear stored API call history
apiDebugger.clear();

// Generate and view debug report in console
apiDebugger.report();

// Download detailed debug report as text file
apiDebugger.download();
```

#### Features

- **Call History**: Stores last 50 API calls with full request/response data
- **Performance Timing**: Tracks request duration for performance analysis
- **Error Tracking**: Easy access to failed API calls and error patterns
- **Debug Reports**: Downloadable reports for troubleshooting and support
- **Automatic Activation**: Enabled in development mode by default

#### Debug Report Contents

- Request/response details for recent API calls
- Performance timing information
- Error summaries and stack traces
- Request/response body data (truncated for readability)
- Failed calls with detailed error information

### Troubleshooting

#### Common Debugging Workflows

1. **Enable Debug Mode**:

   ```javascript
   enableDebugMode();
   apiDebugger.enable();
   ```

2. **Reproduce Issue**: Perform the action that's causing problems

3. **Check Logs**: Look for error messages or unexpected behavior in console

4. **Analyze API Calls**:

   ```javascript
   // Check recent API activity
   apiDebugger.getCalls();

   // Look for failures
   apiDebugger.getFailedCalls();
   ```

5. **Generate Report**: Download comprehensive debug report
   ```javascript
   apiDebugger.download();
   ```

#### Log Message Format

```
🔍 [Context] Debug message with data
ℹ️ [Context] Info message with data
⚠️ [Context] Warning message with data
❌ [Context] Error message with data
```

#### Performance Monitoring

API debugger automatically tracks request timing:

```javascript
// View performance data for recent calls
apiDebugger.getCalls().map((call) => ({
  url: call.url,
  duration: call.duration,
  status: call.status,
}));
```

## Database (SQLite + Prisma)

- **Location:** SQLite file at `prisma/dev.db` (or `DATABASE_URL`).
- **Migrations:** `npx prisma migrate deploy` to apply; `npx prisma migrate dev --name <name>` to create new migrations.
- **Reset:** Delete `prisma/dev.db` and run `npx prisma migrate deploy` to start fresh.
- **Studio:** `npx prisma studio` to browse and edit data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Styled Components](https://styled-components.com/)
- [PapaParse](https://www.papaparse.com/)
- [idb](https://github.com/jakearchibald/idb)
- [Lucide](https://lucide.dev/)

## Testing

This project uses Vitest for unit and integration testing, and React Testing Library for rendering and interacting with components in tests.

### Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage report:

```bash
npm run test:coverage
```

### Writing Tests

- Test files should be co-located with the component or module they're testing.
- Use the `.test.tsx` or `.test.ts` extension for test files.
- Follow the Arrange-Act-Assert pattern in your tests.
- Use React Testing Library's queries to interact with components.

### Coverage

We aim for high test coverage, but also focus on meaningful tests that verify component behavior, not just lines covered.
