document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');

    let allCompanyData = []; // Variable to store all parsed company data
    let currentChart = null; // Variable to hold the current chart instance

    // DOM Element References
    const companyListElement = document.getElementById('companyList');
    const chartTitleElement = document.getElementById('chartTitle');
    const stockChartCanvas = document.getElementById('stockChart'); // Get the canvas element
    const noDataMessageElement = document.getElementById('noDataMessage');

    /**
     * Displays a chart for the selected company.
     * @param {string} companyName - The name of the company to display the chart for.
     */
    function displayChartForCompany(companyName) {
        console.log(`Attempting to display chart for: ${companyName}`);
        chartTitleElement.textContent = `Stock Data for ${companyName}`; // Update chart title

        // Filter data for the selected company
        const companySpecificData = allCompanyData.filter(item => item.CompanyName === companyName && item.Date && item.StockPrice !== undefined);

        // Sort data by date to ensure the line chart displays chronologically
        companySpecificData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        if (companySpecificData.length === 0) {
            console.warn(`No data found for ${companyName} after filtering.`);
            noDataMessageElement.textContent = `No valid stock data (Date, StockPrice) available for ${companyName}.`;
            noDataMessageElement.style.display = 'block';
            stockChartCanvas.style.display = 'none'; // Hide the canvas
            if (currentChart) {
                currentChart.destroy(); // Destroy any existing chart
                currentChart = null;
            }
            return;
        }

        // If data exists, hide the "no data" message and show the canvas
        noDataMessageElement.style.display = 'none';
        stockChartCanvas.style.display = 'block';

        // Prepare data for Chart.js
        const labels = companySpecificData.map(item => item.Date); // E.g., ['2023-01-01', '2023-01-02', ...]
        const stockPrices = companySpecificData.map(item => item.StockPrice); // E.g., [150, 152, ...]
        // const volumes = companySpecificData.map(item => item.Volume); // Optional: for a volume chart

        // Destroy the previous chart instance if it exists
        if (currentChart) {
            currentChart.destroy();
        }

        // Create a new chart
        const ctx = stockChartCanvas.getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line', // Type of chart (e.g., line, bar, pie)
            data: {
                labels: labels, // X-axis labels (Dates)
                datasets: [{
                    label: `Stock Price (${companyName})`, // Legend label for this dataset
                    data: stockPrices, // Y-axis data (Stock Prices)
                    borderColor: 'rgba(0, 123, 255, 1)', // Line color
                    backgroundColor: 'rgba(0, 123, 255, 0.1)', // Area fill color under the line
                    tension: 0.1, // Makes the line slightly curved, 0 for straight lines
                    fill: true // Fill area under the line
                }
                // { // Example for a second dataset (e.g., Volume)
                //     label: `Volume (${companyName})`,
                //     data: volumes,
                //     borderColor: 'rgba(40, 167, 69, 1)',
                //     backgroundColor: 'rgba(40, 167, 69, 0.1)',
                //     yAxisID: 'yVolume', // Assign to a different Y axis if needed
                //     type: 'bar' // Can be a different chart type
                // }
            ]
            },
            options: {
                responsive: true, // Makes the chart responsive to container size
                maintainAspectRatio: false, // Important for custom height via CSS
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                        // If dates are actual Date objects or parsable, Chart.js can use a time scale:
                        // type: 'time',
                        // time: {
                        //     unit: 'day', // or 'month', 'year'
                        //     tooltipFormat: 'll' // Luxon format for tooltips
                        // }
                    },
                    y: { // Default Y-axis for stock prices
                        title: {
                            display: true,
                            text: 'Stock Price ($)'
                        },
                        beginAtZero: false // Better for stock prices that don't start near zero
                    }
                    // yVolume: { // Example for a secondary Y-axis for Volume
                    //     type: 'linear',
                    //     position: 'right',
                    //     title: {
                    //         display: true,
                    //         text: 'Volume'
                    //     },
                    //     grid: {
                    //         drawOnChartArea: false, // only want the grid lines for one axis to show up
                    //     }
                    // }
                },
                plugins: {
                    legend: {
                        position: 'top', // Display legend at the top
                    },
                    tooltip: {
                        mode: 'index', // Show tooltips for all datasets at that x-index
                        intersect: false, // Tooltip will appear even if not hovering directly over a point
                    }
                }
            }
        });
        console.log(`Chart displayed for: ${companyName}`);
    }

    /**
     * Populates the company list in the sidebar.
     * @param {Array<Object>} parsedData - The array of company data objects from CSV.
     */
    function displayCompanyList(parsedData) {
        if (!parsedData || parsedData.length === 0) {
            companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-muted">No company data to display.</span></li>`;
            return;
        }
        const companyNames = [...new Set(parsedData.map(item => item.CompanyName).filter(name => name))];
        if (companyNames.length === 0) {
            companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-muted">No unique company names found.</span></li>`;
            return;
        }
        companyListElement.innerHTML = ''; // Clear loading/error messages

        companyNames.forEach(companyName => {
            const listItem = document.createElement('li');
            listItem.classList.add('nav-item');
            const link = document.createElement('a');
            link.classList.add('nav-link');
            link.href = '#';
            link.textContent = companyName;
            link.setAttribute('data-company', companyName);

            link.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`Company clicked: ${companyName}`); // This log remains useful
                displayChartForCompany(companyName); // Call the chart display function

                document.querySelectorAll('#companyList .nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                link.classList.add('active');
            });
            listItem.appendChild(link);
            companyListElement.appendChild(listItem);
        });
    }

    /**
     * Fetches and parses CSV data.
     */
    async function loadCompanyData() {
        const csvFilePath = 'dump.csv';
        try {
            console.log(`Workspaceing CSV data from: ${csvFilePath}`);
            const response = await fetch(csvFilePath);
            if (!response.ok) {
                console.error(`Error fetching CSV: ${response.status} ${response.statusText}`);
                companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-danger">Error loading company data. File not found or server error.</span></li>`;
                chartTitleElement.textContent = 'Error Loading Data';
                noDataMessageElement.textContent = 'Could not load company data file.';
                noDataMessageElement.style.display = 'block';
                stockChartCanvas.style.display = 'none';
                return;
            }
            const csvText = await response.text();
            console.log('CSV data fetched successfully.');

            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: function(results) {
                    console.log('PapaParse complete callback triggered.');
                    if (results.data && results.data.length > 0) {
                        allCompanyData = results.data;
                        console.log('Stored Parsed CSV Data:', allCompanyData);
                        displayCompanyList(allCompanyData);
                        // Initially, no company is selected, so the chart area shows a prompt
                        chartTitleElement.textContent = 'Select a Company to View Chart';
                        noDataMessageElement.style.display = 'none'; // Hide if it was shown due to load error
                        stockChartCanvas.style.display = 'block'; // Ensure canvas is visible for placeholder or first chart
                         // Display a default message or placeholder on the canvas if no company is selected yet
                        if(currentChart) currentChart.destroy(); // Clear any previous chart
                        const ctx = stockChartCanvas.getContext('2d');
                        // You could draw a placeholder message on the canvas itself or leave it blank
                        // For now, the h1 title "Select a Company..." serves this purpose.

                    } else {
                        console.warn('No data found in CSV or CSV is empty after parsing.');
                        companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-muted">No data found in CSV file.</span></li>`;
                        chartTitleElement.textContent = 'No Data Available';
                        noDataMessageElement.textContent = 'The CSV file is empty or contains no usable data.';
                        noDataMessageElement.style.display = 'block';
                        stockChartCanvas.style.display = 'none';
                    }
                    if (results.errors && results.errors.length > 0) {
                        console.error('Errors during CSV parsing:', results.errors);
                    }
                },
                error: function(error) {
                    console.error('PapaParse Error:', error.message);
                    companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-danger">Error parsing CSV data.</span></li>`;
                    chartTitleElement.textContent = 'Error Parsing Data';
                    noDataMessageElement.textContent = 'Could not parse the CSV data. Please check the file format.';
                    noDataMessageElement.style.display = 'block';
                    stockChartCanvas.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('General error in loadCompanyData:', error);
            companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-danger">Could not load company data. Check console.</span></li>`;
            chartTitleElement.textContent = 'Error';
            noDataMessageElement.textContent = 'An unexpected error occurred while loading data.';
            noDataMessageElement.style.display = 'block';
            stockChartCanvas.style.display = 'none';
        }
    }

    // Call the function to load data
    loadCompanyData();
});