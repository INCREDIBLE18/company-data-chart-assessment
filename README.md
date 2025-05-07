# Index Data Visualizer

A responsive web application that loads financial index data from a CSV file, allows users to browse, search, and select indices, and displays interactive time-series charts (line or bar) with support for date filtering and zoom/pan functionality.

## Overview

This project provides a user-friendly interface to visualize time-series data for different financial indices stored in a `dump.csv` file. Users can easily search for specific indices, view their data trends over selected date ranges, switch between different metrics (like Closing Value and Volume), and interact with the charts through zooming and panning.

## Screenshots

*(Placeholder: Add screenshots of your application here!)*

* *Screenshot of the main interface with sidebar and chart area.*
* *Screenshot showing the search filter in action.*
* *Screenshot showing the date range filter applied.*
* *Screenshot showing the volume bar chart selected.*
* *Screenshot showing zoom/pan interaction.*

## Features

* **CSV Data Loading:** Reads and parses data from `dump.csv` using PapaParse.
* **Dynamic Index List:** Displays a list of unique index names from the CSV in a collapsible sidebar.
* **Index Search:** Filter the index list in real-time using a search input.
* **Interactive Charting:** Renders charts using Chart.js for the selected index.
    * Displays **available date range** (min/max dates) for the selected index's data.
    * Supports **date range filtering** via user inputs.
    * Supports switching between metrics (**Closing Value** as line chart, **Volume** as bar chart).
    * Includes **zoom and pan** functionality on the time (X) axis via `chartjs-plugin-zoom`.
    * Provides a **Reset Zoom** button.
* **Date Handling:** Includes logic to parse different date formats (specifically handling potential `DD-MM-YYYY` format from CSV alongside standard formats).
* **Responsive UI:** Built with Bootstrap for adaptability across different screen sizes (desktops, tablets, mobile).
* **Error Handling:** Basic handling and messages for data loading/parsing errors or lack of data.

## Tech Stack / Libraries

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **CSS Framework:** Bootstrap 4.5
* **Charting:** Chart.js vX.Y.Z (Check CDN link for version)
* **Chart Plugins:**
    * `chartjs-plugin-zoom` v2.0.1 (for zoom/pan)
    * Hammer.js v2.0.8 (dependency for zoom plugin touch events)
* **CSV Parsing:** PapaParse v5.3.0

## Project Structure
/project-root
├── index.html          # Main HTML structure
├── style.css           # Custom CSS styles
├── script.js           # Core JavaScript logic (data loading, UI, charting)
└── dump.csv            # CSV file containing the index data

* **`index.html`**: Defines the page layout, including sidebar, chart area, input controls (search, date pickers, metric select, buttons), and includes necessary CSS and JS files/libraries.
* **`style.css`**: Contains custom styles for layout adjustments, component styling, and responsiveness overrides.
* **`script.js`**: Handles all dynamic behavior: fetching/parsing CSV, populating the index list, filtering the list, managing chart creation/updates (using Chart.js), handling date filtering, metric switching, zoom/pan interactions, and displaying informational messages.
* **`dump.csv`**: The source data file. **Crucially**, this file must contain the expected headers for the script to work correctly.

## Setup and Usage

### Prerequisites

* A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
* A local copy of the project files.
* (Optional) Git, if cloning from a repository.

### Getting Started

1.  **Obtain the Code:**
    * Clone the repository (if available): `git clone <repository_url>`
    * OR: Download the `index.html`, `style.css`, `script.js`, and `dump.csv` files into a single local directory.

2.  **Prepare `dump.csv`:**
    * Place your `dump.csv` file in the root project directory.
    * Ensure the CSV file has a header row.
    * **Required Headers:** The script currently expects the following column names:
        * `index_name` (for the list and filtering)
        * `index_date` (for the time axis; the script includes logic to parse `DD-MM-YYYY` and standard formats like `YYYY-MM-DD`)
        * `closing_index_value` (for the default line chart metric)
        * `volume` (for the selectable bar chart metric)
        * `open_index_value`, `high_index_value`, `low_index_value` (needed if you later implement candlestick charts).
    * If your headers differ, you *must* update the corresponding property names within `script.js`.

3.  **Running the Application (Local Server Required):**
    * **Why?** Modern browsers restrict web pages loaded directly from the local file system (`file:///...`) from fetching other local files (like `dump.csv`) due to security policies (CORS).
    * **How?** You need to serve the project files using a simple local web server. Choose one of these methods:
        * **VS Code Live Server:** If using Visual Studio Code, install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server."
        * **Python:** Open a terminal/command prompt in your project directory and run:
            * Python 3: `python -m http.server`
            * Python 2: `python -m SimpleHTTPServer`
            * Then open `http://localhost:8000` (or the port shown) in your browser.
        * **Node.js (`http-server`):** Install it (`npm install -g http-server`), navigate to your project directory in the terminal, run `http-server`, and open the provided URL (e.g., `http://localhost:8080`).

### Using the Interface

1.  **Loading:** The page will load, parse `dump.csv`, and populate the index list in the sidebar.
2.  **Search Indices:** Type into the "Search indices..." box in the sidebar to filter the list.
3.  **Select Index:** Click an index name in the sidebar.
    * The main chart title will update.
    * The available date range for that index will be shown below the controls.
    * A line chart showing the "Closing Value" for the full available date range will be displayed.
4.  **Change Metric:** Use the "Metric" dropdown to switch between "Closing Value" (line chart) and "Volume" (bar chart). Click "Apply".
5.  **Filter by Date:** Select a "Start Date" and/or "End Date" using the date pickers and click "Apply". The chart will update to show data only for the selected range and metric.
6.  **Clear Date Filter:** Click the "Clear" button to remove the date filters and view all data for the currently selected index and metric.
7.  **Zoom/Pan:** Use the mouse wheel (or pinch gesture on touch devices) over the chart area to zoom in/out along the time (X) axis. Click and drag to pan the chart horizontally.
8.  **Reset Zoom:** Click the "Reset Zoom" button to return the chart to its default zoom level, showing the currently filtered data range.

## Code Explanation (`script.js` highlights)

* **Event Listener (`DOMContentLoaded`):** Ensures the script runs only after the HTML document is fully loaded.
* **Global Variables:** `allCompanyData` (stores parsed CSV), `currentChart` (holds the Chart.js instance), `currentSelectedIndexName`, `currentSelectedMetric`.
* **Helper Functions:**
    * `parseDMYtoDate(dateString)`: Parses date strings, attempting `DD-MM-YYYY` first, then falling back to standard parsing. Crucial for correct sorting and filtering if CSV dates are not standard.
    * `formatDateToYYYYMMDD(dateObject)`: Converts Date objects to `YYYY-MM-DD` strings, primarily used for creating Chart.js labels consistently.
* **`loadCompanyData()`:** Uses `Workspace` to get `dump.csv` and `Papa.parse()` to convert it into an array of objects stored in `allCompanyData`. Calls `displayCompanyList`. Includes error handling.
* **`displayCompanyList(parsedData)`:** Extracts unique `index_name` values, creates list items (`<li><a>`), and appends them to the sidebar (`#companyList`). Attaches click listeners to each item. (Note: Alphabetical sorting was removed as per prior feedback but could be re-added by sorting the `companyNames` array).
* **`filterIndexList()`:** Attached to the search input (`#searchIndexInput`), it filters the visibility of items in the sidebar list based on the search term.
* **`displayChartForCompany(indexNameParam)`:** This is the core function for charting:
    * Filters `allCompanyData` for the selected index and ensures the selected metric data is valid.
    * Calculates and displays the min/max available date range for that index.
    * Applies user-selected date range filters.
    * Filters data based on the selected metric (`#metricSelect`).
    * Sorts the final data by date.
    * Destroys the previous `currentChart` instance if it exists.
    * Handles the "no data" display logic.
    * Prepares `labels` (dates, formatted as `YYYY-MM-DD`) and `dataValues` (numeric metric data).
    * Dynamically determines `chartType` ('line' or 'bar'), dataset properties (label, colors), and Y-axis configuration (`label`, `beginAtZero`) based on the selected metric.
    * Configures the `chartjs-plugin-zoom` options within `options.plugins.zoom`.
    * Creates the `new Chart(...)` instance.
* **Event Listeners:** Handlers for the "Apply", "Clear", "Reset Zoom" buttons and the "Metric" select dropdown trigger updates by calling `displayChartForCompany` appropriately.

## Potential Future Enhancements

* Add more metric options to the dropdown (e.g., PE Ratio, Dividend Yield).
* Implement more sophisticated chart types (Candlestick, OHLC - would likely require switching back to a library like ApexCharts or TradingView Lightweight Charts and resolving performance/API issues).
* Add technical analysis indicators (requires specialized libraries).
* Implement chart drawing tools (lines, annotations - very complex).
* Add data loading indicators for better UX.
* Improve performance for very large datasets (e.g., data aggregation, virtual scrolling for list).
* Save user preferences (like selected metric or dates) using L