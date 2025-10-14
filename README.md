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
- **Data Persistence:**
  - IndexedDB (via idb library)
- **CSV Parsing:**
  - PapaParse
- **Icons:**
  - Lucide React
- **Progressive Web App:**
  - Custom Service Worker

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

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Building for Production

To create a production build:

```
npm run build
```

The built files will be in the `dist` directory.

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

## Database Schema Maintenance

Our Prisma schema stays synced with the live Supabase database using:

- `npm run db:sync` - Pull changes and regenerate types
- `npm run db:check-drift` - Detect schema drift
- Weekly automated checks via GitHub Actions

See [Schema Maintenance Guide](./docs/schema-maintenance.md) for full details.

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
