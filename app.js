document.addEventListener('DOMContentLoaded', function() {
    // Load default CSV data
    loadDefaultCSV();

    document.getElementById('csvFile').addEventListener('change', handleFileSelect, false);
    document.getElementById('leverageFactor').addEventListener('input', updateLeverageValue, false);
});

let rawData = [];
let leverageFactor = 3;

function loadDefaultCSV() {
    // Default CSV file URL
    const defaultCSVUrl = 'HistoricalData_1722553187753.csv';

    fetch(defaultCSVUrl)
        .then(response => response.text())
        .then(text => {
            rawData = parseCSV(text);
            console.log('Loaded Default Data:', rawData); // Debugging line
            populateStartingPoints(); // Populate dropdown with dates from CSV
        })
        .catch(error => console.error('Error loading default CSV:', error));
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            rawData = parseCSV(text);
            console.log('Parsed Data:', rawData); // Debugging line
            populateStartingPoints(); // Populate dropdown with dates from CSV
        };
        reader.readAsText(file);
    }
}

function parseCSV(text) {
    const rows = text.split('\n');
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            date: cols[0],
            close: parseFloat(cols[1]),
            open: parseFloat(cols[2]),
            high: parseFloat(cols[3]),
            low: parseFloat(cols[4])
        };
    });
}

function populateStartingPoints() {
    const dropdown = document.getElementById('startingPoint');
    dropdown.innerHTML = ''; // Clear existing options
    rawData.forEach((data, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = data.date;
        dropdown.appendChild(option);
    });
}

function updateLeverageValue() {
    leverageFactor = parseFloat(document.getElementById('leverageFactor').value);
    document.getElementById('leverageValue').textContent = leverageFactor;
}

function startSimulation() {
    if (rawData.length === 0) {
        alert('Please upload a CSV file or ensure default data is loaded.');
        return;
    }

    const selectedIndex = parseInt(document.getElementById('startingPoint').value, 10);
    if (isNaN(selectedIndex) || selectedIndex >= rawData.length) {
        alert('Please select a valid starting point.');
        return;
    }

    const simulations = [];
    for (let i = selectedIndex; i < rawData.length - 10; i++) {
        let value = 1; // Starting with an arbitrary investment of $1
        for (let j = i; j < rawData.length; j++) {
            const open = rawData[j].open;
            const close = rawData[j].close;
            const date = rawData[j].date;

            // Validate data
            if (isNaN(open) || isNaN(close) || open === 0 || !isValidDate(date)) {
                continue;
            }

            const dailyChange = (close - open) / open;
            value += value * dailyChange * leverageFactor;
        }
        simulations.push({ startDate: rawData[i].date, finalValue: value });
        console.log('Simulation:', { startDate: rawData[i].date, finalValue: value }); // Debug
    }

    console.log('Simulations:', simulations); // Debugging line
    plotGraph(simulations);
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function plotGraph(simulations) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = simulations.map(sim => sim.startDate);
    const data = simulations.map(sim => sim.finalValue);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Leverage Simulation',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    display: true,
                    align: 'top',
                    color: 'black',
                    formatter: function(value) {
                        return value.toFixed(2); // Format the value to 2 decimal places
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Start Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Final Value ($)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
