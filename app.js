document.getElementById('csvFile').addEventListener('change', handleFileSelect, false);

let rawData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            rawData = parseCSV(text);
            console.log('Parsed Data:', rawData); // Debugging line
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

function startSimulation() {
    if (rawData.length === 0) {
        alert('Please upload a CSV file first.');
        return;
    }

    const simulations = [];
    const leverageFactor = 3;
for (let i = 0; i < rawData.length - 10; i++) {
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

function isValidDate(dateString) {
    // Check if the date string is in a valid format (e.g., YYYY-MM-DD)
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
}