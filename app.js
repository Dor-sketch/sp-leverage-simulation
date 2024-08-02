document.addEventListener('DOMContentLoaded', function() {
    loadDefaultCSV();

    document.getElementById('startSimulation').addEventListener('click', startSimulation, false);
    // listen to changes in the leverage factor input field
    document.getElementById('leverageFactor').addEventListener('change', updateLeverageValue, false);
});

let rawData = [];
let leverageFactor = 3;

function loadDefaultCSV() {
    const defaultCSVUrl = 'HistoricalData_1722553187753.csv';

    fetch(defaultCSVUrl)
        .then(response => response.text())
        .then(text => {
            rawData = parseCSV(text);
            console.log('Loaded Default Data:', rawData);
            populateStartingPoints();
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
            console.log('Parsed Data:', rawData);
            populateStartingPoints();
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
    }).reverse(); // Reverse the array to have oldest data first
}

function populateStartingPoints() {
    const dropdown = document.getElementById('startingPoint');
    dropdown.innerHTML = '';
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
    console.log('Updated Leverage Factor:', leverageFactor);
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
    const simulationsNoLeverage = [];

    for (let i = selectedIndex; i < rawData.length; i++) {
        let valueLeverage = 1;
        let valueNoLeverage = 1;

        for (let j = selectedIndex; j <= i; j++) {
            const open = rawData[j].open;
            const close = rawData[j].close;
            const date = rawData[j].date;

            if (isNaN(open) || isNaN(close) || open === 0 || !isValidDate(date)) {
                continue;
            }

            const dailyChange = (close - open) / open;
            valueLeverage += valueLeverage * dailyChange * leverageFactor;
            valueNoLeverage += valueNoLeverage * dailyChange;
        }

        simulations.push({ date: rawData[i].date, value: valueLeverage });
        simulationsNoLeverage.push({ date: rawData[i].date, value: valueNoLeverage });
    }

    plotGraph(simulations, simulationsNoLeverage);
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function plotGraph(simulationsLeverage, simulationsNoLeverage) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: simulationsLeverage.map(sim => sim.date),
            datasets: [
                {
                    label: 'Leverage Simulation',
                    data: simulationsLeverage.map(sim => sim.value),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'No Leverage Simulation',
                    data: simulationsNoLeverage.map(sim => sim.value),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            plugins: {
                datalabels: {
                    display: false,
                    align: 'top',
                    color: 'black',
                    formatter: function(value) {
                        return value.toFixed(2);
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value ($)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}