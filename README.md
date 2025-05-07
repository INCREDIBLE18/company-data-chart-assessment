# Company Data Visualizer

A simple, responsive web page that lists companies from a `dump.csv` file. When a company name is clicked, a chart (using Chart.js) is displayed showing its stock price data over time. This project fulfills the requirements of a web development skill evaluation.

## Features

-   **CSV Data Handling:** Reads and parses data from `dump.csv` using PapaParse.
-   **Dynamic Company List:** Displays a list of unique company names extracted from the CSV in a sidebar.
-   **Interactive Charting:** Renders a line chart using Chart.js when a company is selected, showing relevant data (e.g., Stock Price vs. Date).
-   **Responsive UI:** Built with HTML, custom CSS, and Bootstrap for adaptability across different screen sizes.
-   **Error Handling:** Includes basic error messages for issues like CSV loading/parsing failures or missing data for a selected company.
-   **Clear Code with Comments:** JavaScript is organized into functions with comments explaining the logic.

## Project Structure

-   `index.html`: The main HTML file containing the page structure, including placeholders for the company list and chart.
-   `style.css`: Custom CSS rules for styling the page, sidebar, chart container, and ensuring responsiveness.
-   `script.js`: Core JavaScript logic for:
    -   Fetching and parsing `dump.csv`.
    -   Populating the company list.
    -   Handling user interactions (company selection).
    -   Generating and updating charts with Chart.js.
-   `dump.csv`: The Comma-Separated Values file containing the source data. It's expected to have headers like `CompanyName`, `Date`, and `StockPrice`.
-   `README.md`: This file, providing information about the project.

## Setup and Usage Instructions

1.  **Get the Code:**
    * Clone the repository: `git clone <repository_url>`
    * Alternatively, download the files (`index.html`, `style.css`, `script.js`, `dump.csv`) and place them in a single project directory.

2.  **`dump.csv` File:**
    * Ensure the `dump.csv` file is present in the root of your project directory.
    * The script expects the CSV to have at least the following headers for full functionality:
        * `CompanyName` (Text: Name of the company)
        * `Date` (Text/Date: The date for the data point, preferably in a format parsable by `new Date()` e.g., `YYYY-MM-DD`)
        * `StockPrice` (Numeric: The stock price for that date)
        * `Volume` (Numeric, Optional: Trading volume, can be added to the chart with minor script modification)
    * If your CSV headers are different, you will need to adjust the corresponding property accessors in `script.js` (e.g., `item.YourHeaderName`).

3.  **Running the Web Page (Local Server Required):**
    * Due to browser security restrictions (CORS policy), directly opening `index.html` from the local file system (`file:///...`) will prevent the `Workspace` API in `script.js` from loading `dump.csv`.
    * **You must serve the files using a local web server.** Here are common methods:

    * **Using VS Code Live Server Extension:**
        1.  If you use Visual Studio Code, install the "Live Server" extension by Ritwick Dey.
        2.  Open your project folder in VS Code.
        3.  Right-click on `index.html` in the Explorer panel and select "Open with Live Server."

    * **Using Python's HTTP Server:**
        1.  Open your terminal or command prompt.
        2.  Navigate (`cd`) to your project directory.
        3.  Run one of the following commands:
            * Python 3: `python -m http.server`
            * Python 2: `python -m SimpleHTTPServer`
        4.  Open your web browser and go to `http://localhost:8000` (or the port number displayed in the terminal).

    * **Using Node.js `http-server`:**
        1.  Ensure Node.js and npm are installed.
        2.  Install `http-server` globally (if not already installed): `npm install -g http-server`
        3.  Open your terminal or command prompt and navigate (`cd`) to your project directory.
        4.  Run: `http-server`
        5.  Open your browser and go to the URL provided (e.g., `http://localhost:8080`).

4.  **Interacting with the Page:**
    * Once loaded, the list of companies will appear in the sidebar on the left.
    * Click on a company name to display its stock price chart in the main area on the right.

## Code Logic Highlights (`script.js`)

-   **`DOMContentLoaded`**: Ensures the script executes only after the HTML document is fully loaded.
-   **`loadCompanyData()`**: An `async` function that uses `Workspace` to retrieve `dump.csv`. It then uses `Papa.parse()` for robust CSV-to-JSON conversion. The parsed data is stored, and the company list is populated. Error handling is included for both fetching and parsing.
-   **`displayCompanyList(parsedData)`**: Extracts unique company names from the data using `Set` and `map`. It dynamically creates list items (`<li>` with `<a>` tags) for each company and appends them to the sidebar. Click event listeners are attached to these items.
-   **`displayChartForCompany(companyName)`**:
    -   Filters the global `allCompanyData` for records matching the selected `companyName` and ensures necessary data fields (`Date`, `StockPrice`) are present.
    -   Sorts the company-specific data by date.
    -   Prepares `labels` (dates) and `datasets` (stock prices) for Chart.js.
    -   Crucially, if a `currentChart` instance exists, it calls `currentChart.destroy()` before creating a new chart. This prevents rendering issues and memory leaks.
    -   Initializes a new `Chart` instance with `type: 'line'` and configured options for axes, legend, and tooltips.
    -   Handles cases where no valid data is found for the selected company by displaying a message.

## Evaluation Criteria Considerations

-   **Code Quality & Documentation:** The JavaScript code is organized into functions with clear responsibilities and includes comments explaining key logic. HTML is semantic, and CSS is structured.
-   **Functionality & Responsiveness:** The core requirements of listing companies and displaying data-driven charts upon selection are met. Bootstrap and custom CSS provide a responsive layout that adapts to different screen sizes.
-   **Creativity & Additional Features:** This implementation focuses on robustly delivering the core requirements. Potential creative enhancements (not part of this core submission) could include:
    -   Allowing users to select different chart types (e.g., bar for volume).
    -   Implementing a date range selector for the chart.
    -   Comparing data from multiple companies on the same chart.
    -   More advanced visual styling or animations.

## Bonus Opportunity: `stockCharts` Open-Source Project

Regarding the suggestion to explore the `stockCharts` open-source project ([https://lnkd.in/gAH42EFM](https://lnkd.in/gAH42EFM)):

My approach to contributing would be:
1.  **Setup and Familiarization:** Clone the repository, ensure I can build and run the project locally. I would then dive into its documentation (if available), existing codebase, and open issues to understand its architecture, current features, and contribution guidelines.
2.  **Identify Potential Contributions:** Based on the project's needs and my skills, I would look for areas to contribute. This could range from:
    * Tackling an existing bug or small feature request marked as "good first issue."
    * Improving documentation.
    * Proposing and implementing a new, innovative feature (e.g., a new type of technical indicator, enhanced chart interactivity, or improved data visualization techniques) if I identify a gap that aligns with the project's goals.
3.  **Engage and Implement:** I would engage with the project maintainers (e.g., by commenting on an issue or opening a new one for discussion) before starting significant work. Once a contribution path is clear, I would implement the feature or fix, adhering to the project's coding standards and testing practices, and then submit a pull request.

This demonstrates a proactive and structured approach to engaging with an open-source project.

## Reflection on Internship Intent

I have carefully read the note regarding the intent of this internship. My primary motivation for applying is precisely for the skill development and genuine professional guidance that you emphasize. I am eager to immerse myself in a practical learning environment where I can enhance my web development skills, gain hands-on experience with real-world projects or challenging tasks like this one, and benefit from mentorship. I understand that the focus is on growth and learning, not just on obtaining a certificate or financial support, and this aligns perfectly with my career development goals. I am keen to contribute, learn, and evolve professionally.

Thank you for this opportunity.