document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');

    let allCompanyData = [];
    let currentChart = null;
    let currentSelectedIndexName = null;
    let currentSelectedMetric = 'closing_index_value'; // Default metric

    // DOM Element References
    const companyListElement = document.getElementById('companyList');
    const chartTitleElement = document.getElementById('chartTitle');
    const stockChartCanvas = document.getElementById('stockChart');
    const noDataMessageElement = document.getElementById('noDataMessage');
    const searchIndexInputElement = document.getElementById('searchIndexInput');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const metricSelectElement = document.getElementById('metricSelect'); // <<< ADDED: Metric Select
    const applyDateFilterBtn = document.getElementById('applyDateFilterBtn');
    const clearDateFilterBtn = document.getElementById('clearDateFilterBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn'); // <<< ADDED: Reset Zoom Button
    const availableDateRangeInfoElement = document.getElementById('availableDateRangeInfo');

    // --- Helper Functions for Date Handling ---
    function parseDMYtoDate(dateString) {
         if (!dateString || typeof dateString !== 'string') return null;
         const parts = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
         if (parts) {
             const day = parseInt(parts[1], 10);
             const month = parseInt(parts[2], 10) - 1;
             const year = parseInt(parts[3], 10);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >=0 && month <=11 && day >=1 && day <=31) {
                 let d = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues in parsing
                 if (d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day) {
                     return d;
                 }
             }
         }
         const d = new Date(dateString); // Fallback for YYYY-MM-DD etc.
         if (!isNaN(d.getTime())) return d;
         // console.warn(`Could not parse date string: ${dateString}`);
         return null;
     }

    function formatDateToYYYYMMDD(dateObject) {
        if (!dateObject || isNaN(dateObject.getTime())) return null;
         // Use UTC methods to format to avoid timezone shifts affecting the date part
        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Feature: Sidebar Index Search Filter ---
    function filterIndexList() {
        // ... (remains the same)
        if (!searchIndexInputElement) return;
        const searchTerm = searchIndexInputElement.value.toLowerCase();
        const listItems = companyListElement.getElementsByTagName('li');
        for (let i = 0; i < listItems.length; i++) {
            const linkElement = listItems[i].querySelector('a.nav-link');
            if (linkElement) {
                const indexName = linkElement.textContent.toLowerCase();
                if (indexName.includes(searchTerm)) {
                    listItems[i].style.display = '';
                } else {
                    listItems[i].style.display = 'none';
                }
            } else if (listItems[i].querySelector('span.nav-link.text-muted') || listItems[i].querySelector('span.nav-link.text-danger')) {
                if (searchTerm === "") { listItems[i].style.display = ''; } else { listItems[i].style.display = 'none'; }
            }
        }
    }
    if (searchIndexInputElement) {
        searchIndexInputElement.addEventListener('keyup', filterIndexList);
    }


    // --- Core Chart Display Function (Now handles metric selection and zoom) ---
    /**
     * Displays a chart for the selected index, considering date filters and selected metric.
     * @param {string} indexNameParam - The name of the index.
     */
    function displayChartForCompany(indexNameParam) {
        console.log(`Attempting to display chart for: ${indexNameParam}, Metric: ${currentSelectedMetric}`);
        currentSelectedIndexName = indexNameParam; // Store current index
        chartTitleElement.textContent = `Index Data for ${indexNameParam}`;

        // 1. Get and filter data for the selected index & metric
        const metricKey = currentSelectedMetric; // e.g., 'closing_index_value' or 'volume'
        const unfilteredCompanySpecificData = allCompanyData.filter(item =>
            item.index_name === indexNameParam &&
            item.index_date &&
            item[metricKey] !== undefined && // Check the selected metric column
            !isNaN(parseFloat(item[metricKey])) && // Ensure metric value is a number
            parseDMYtoDate(item.index_date) !== null // Ensure date is parseable
        );

        // 2. Display Available Date Range (using the same logic as before)
        if (availableDateRangeInfoElement) {
            if (unfilteredCompanySpecificData.length > 0) {
                const sortedFullData = [...unfilteredCompanySpecificData].sort((a, b) => parseDMYtoDate(a.index_date) - parseDMYtoDate(b.index_date));
                const minDateStr = sortedFullData[0].index_date;
                const maxDateStr = sortedFullData[sortedFullData.length - 1].index_date;
                availableDateRangeInfoElement.textContent = `Data available from: ${minDateStr} to ${maxDateStr}`;
            } else {
                 availableDateRangeInfoElement.textContent = 'No data available for this index.';
            }
        }

        // 3. Apply Date Filters from UI Inputs
        const startDateFilter = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDateFilter = endDateInput.value ? new Date(endDateInput.value) : null;
        if (endDateFilter) { endDateFilter.setHours(23, 59, 59, 999); }

        let dateFilteredData = unfilteredCompanySpecificData.filter(item => {
            const itemDate = parseDMYtoDate(item.index_date);
            if (!itemDate) return false;
            let pass = true;
            if (startDateFilter && itemDate < startDateFilter) pass = false;
            if (endDateFilter && itemDate > endDateFilter) pass = false;
            return pass;
        });

        // 4. Sort the final filtered data
        dateFilteredData.sort((a, b) => parseDMYtoDate(a.index_date) - parseDMYtoDate(b.index_date));

        // 5. Destroy previous chart
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }

        // 6. Handle case where no data remains after filtering
        if (dateFilteredData.length === 0) {
             console.warn(`No valid data found for ${indexNameParam} / ${metricKey} after filtering.`);
             let message = `No valid '${metricKey.replace(/_/g,' ')}' data available for ${indexNameParam}`;
             if (unfilteredCompanySpecificData.length > 0 && (startDateInput.value || endDateInput.value)) {
                  message += ` within the selected date range.`;
             }
             noDataMessageElement.textContent = message;
             noDataMessageElement.style.display = 'block';
             if (stockChartCanvas) stockChartCanvas.style.display = 'none';
             return;
        }

        noDataMessageElement.style.display = 'none';
        if (stockChartCanvas) stockChartCanvas.style.display = 'block';

        // 7. Prepare data and config based on selected metric
        const labels = dateFilteredData.map(item => formatDateToYYYYMMDD(parseDMYtoDate(item.index_date)));
        const dataValues = dateFilteredData.map(item => parseFloat(item[metricKey]));

        let chartType = 'line';
        let yAxisLabel = 'Value';
        let beginYAtZero = false;
        let datasetLabel = `${indexNameParam}`;
        let backgroundColor = 'rgba(0, 123, 255, 0.1)';
        let borderColor = 'rgba(0, 123, 255, 1)';

        if (metricKey === 'closing_index_value') {
            chartType = 'line';
            yAxisLabel = 'Closing Index Value';
            datasetLabel = `Closing Value (${indexNameParam})`;
            beginYAtZero = false; // Usually better for price/index values
        } else if (metricKey === 'volume') {
            chartType = 'bar';
            yAxisLabel = 'Volume';
            datasetLabel = `Volume (${indexNameParam})`;
            beginYAtZero = true; // Volume starts at 0
             backgroundColor = 'rgba(40, 167, 69, 0.5)'; // Different color for volume bars
             borderColor = 'rgba(40, 167, 69, 1)';
        }
        // Add more else if blocks here for other metrics if needed

        // 8. Create new Chart.js instance with dynamic config and zoom plugin
        const ctx = stockChartCanvas.getContext('2d');
        currentChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: datasetLabel,
                    data: dataValues,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    tension: chartType === 'line' ? 0.1 : undefined, // Only for line
                    fill: chartType === 'line' ? true : undefined,   // Only for line
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Index Date' }
                    },
                    y: {
                        title: { display: true, text: yAxisLabel },
                        beginAtZero: beginYAtZero
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false },
                    // Zoom Plugin Configuration
                    zoom: {
                        zoom: {
                            wheel: { enabled: true }, // Enable zooming with mouse wheel
                            pinch: { enabled: true }, // Enable zooming with pinch gesture
                            mode: 'x', // Allow zooming only on the x-axis (time)
                        },
                        pan: {
                            enabled: true, // Enable panning
                            mode: 'x', // Allow panning only on the x-axis
                        },
                        limits: {
                             x: { min: 'original', max: 'original' }, // Allow zooming out to original range
                           // y: { min: 'original', max: 'original' } // Enable if y-axis zoom is desired
                        }
                    }
                }
            }
        });
        console.log(`Chart.js ${chartType} chart displayed for: ${indexNameParam} / ${metricKey}`);
    }

    /**
     * Populates the index list in the sidebar.
     */
    function displayCompanyList(parsedData) {
        // ... (remains the same, no alphabetical sorting)
        if (!parsedData || parsedData.length === 0) {
             companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-muted">No data to display.</span></li>`; return;
        }
        const companyNames = [...new Set(parsedData.map(item => item.index_name).filter(name => name && name.trim() !== ''))];
        if (companyNames.length === 0) {
            companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-muted">No unique index names found.</span></li>`; return;
        }
        companyListElement.innerHTML = '';
        companyNames.forEach(companyName => {
             const listItem = document.createElement('li'); listItem.classList.add('nav-item');
             const link = document.createElement('a'); link.classList.add('nav-link'); link.href = '#';
             link.textContent = companyName; link.setAttribute('data-company', companyName);
             link.addEventListener('click', (event) => {
                 event.preventDefault();
                 currentSelectedMetric = metricSelectElement.value; // Ensure metric is current when clicking index
                 displayChartForCompany(companyName);
                 document.querySelectorAll('#companyList .nav-link').forEach(navLink => navLink.classList.remove('active'));
                 link.classList.add('active');
             });
             listItem.appendChild(link); companyListElement.appendChild(listItem);
         });
    }

    // --- Event Listeners for Controls ---

    // Apply Button (now also considers selected metric)
    if (applyDateFilterBtn) {
        applyDateFilterBtn.addEventListener('click', () => {
            if (currentSelectedIndexName) {
                 currentSelectedMetric = metricSelectElement.value; // Get latest metric selection
                displayChartForCompany(currentSelectedIndexName);
            } else {
                alert("Please select an index first.");
            }
        });
    }

    // Clear Button (clears dates, re-renders with current metric)
    if (clearDateFilterBtn) {
        clearDateFilterBtn.addEventListener('click', () => {
            startDateInput.value = '';
            endDateInput.value = '';
            if (currentSelectedIndexName) {
                 currentSelectedMetric = metricSelectElement.value; // Keep current metric
                displayChartForCompany(currentSelectedIndexName);
            }
        });
    }

    // Metric Select Dropdown
     if (metricSelectElement) {
        metricSelectElement.addEventListener('change', (event) => {
            currentSelectedMetric = event.target.value;
            if (currentSelectedIndexName) {
                // Re-render the chart with the new metric for the current index and date range
                displayChartForCompany(currentSelectedIndexName);
            }
             // Else: Just update the metric, it will be used when an index is next selected/filter applied
        });
    }

     // Reset Zoom Button
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            if (currentChart && typeof currentChart.resetZoom === 'function') {
                currentChart.resetZoom();
            } else {
                 console.log("No active chart or chart does not support resetZoom.");
            }
        });
    }

    // --- Data Loading ---
    async function loadCompanyData() {
        // ... (remains largely the same)
         const csvFilePath = 'dump.csv';
         try {
             console.log(`Workspaceing CSV data from: ${csvFilePath}`);
             const response = await fetch(csvFilePath);
             if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
             const csvText = await response.text();
             console.log('CSV data fetched successfully.');
             Papa.parse(csvText, { /* ... options ... */
                 header: true, skipEmptyLines: true, dynamicTyping: true,
                 complete: function(results) {
                     console.log('PapaParse complete callback triggered.');
                     if (results.data && results.data.length > 0) {
                         allCompanyData = results.data;
                         displayCompanyList(allCompanyData);
                         if (searchIndexInputElement) filterIndexList();
                         chartTitleElement.textContent = 'Select an Index to View Chart';
                         noDataMessageElement.style.display = 'none';
                         if (stockChartCanvas) stockChartCanvas.style.display = 'block';
                         if (availableDateRangeInfoElement) availableDateRangeInfoElement.textContent = '';
                         if (currentChart) { currentChart.destroy(); currentChart = null; }
                     } else { handleLoadError('No data found in CSV or CSV is empty after parsing.'); }
                     if (results.errors && results.errors.length > 0) { console.error('Errors during CSV parsing:', results.errors); }
                 },
                 error: function(error) { console.error('PapaParse Error:', error.message); handleLoadError(`Error parsing CSV data: ${error.message}`); }
             });
         } catch (error) { console.error('General error in loadCompanyData:', error); handleLoadError(`Could not load company data: ${error.message}`); }
     }

     function handleLoadError(message) {
         companyListElement.innerHTML = `<li class="nav-item"><span class="nav-link text-danger">${message}</span></li>`;
         chartTitleElement.textContent = 'Error Loading Data';
         noDataMessageElement.textContent = message;
         noDataMessageElement.style.display = 'block';
         if (stockChartCanvas) stockChartCanvas.style.display = 'none';
         if (availableDateRangeInfoElement) availableDateRangeInfoElement.textContent = '';
    }

    loadCompanyData();
});