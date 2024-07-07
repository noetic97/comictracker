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

- Node.js (v14 or later)
- npm (v6 or later)

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

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

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
