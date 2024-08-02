document.addEventListener('DOMContentLoaded', function() {
    loadDefaultCSV();

    document.getElementById('startSimulation').addEventListener('click', startSimulation, false);
    // listen to changes in the leverage factor input field
    document.getElementById('leverageFactor').addEventListener('change', updateLeverageValue, false);
});

let rawData = [];
let leverageFactor = 3;

function loadDefaultCSV() {
    const defaultCSVUrl = 'GSPC.csv';

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
    return rows.slice(1).map((row, index) => {
        const cols = row.split(',');
        const parsedRow = {
            date: cols[0],
            open: parseFloat(cols[1]),
            high: parseFloat(cols[2]),
            low: parseFloat(cols[3]),
            close: parseFloat(cols[4])
        };

        if (isNaN(parsedRow.close) || isNaN(parsedRow.open) ||
            isNaN(parsedRow.high) || isNaN(parsedRow.low)) {
            console.warn(`Invalid data at index ${index}: ${row}`);
        }

        return parsedRow;
    });
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
        let valueLeverage = rawData[selectedIndex].open;
        let valueNoLeverage = rawData[selectedIndex].open;

        for (let j = selectedIndex; j <= i; j++) {
            const open = rawData[j].open;
            const close = rawData[j].close;
            const date = rawData[j].date;

            if (isNaN(open) || isNaN(close) || open <= 0 || close <= 0 || !isValidDate(date)) {
                console.warn(`Invalid data at index ${j}: date=${date}, open=${open}, close=${close}`);
                continue;
            }

            const dailyReturn = (close - open) / open;

            if (isNaN(dailyReturn) || !isFinite(dailyReturn)) {
                console.warn(`Invalid daily return at index ${j}: ${dailyReturn}`);
                continue;
            }

            valueLeverage *= (1 + dailyReturn * leverageFactor);
            valueNoLeverage *= (1 + dailyReturn);

            if (isNaN(valueLeverage) || !isFinite(valueLeverage) ||
                isNaN(valueNoLeverage) || !isFinite(valueNoLeverage)) {
                console.error(`Invalid value calculated at index ${j}: valueLeverage=${valueLeverage}, valueNoLeverage=${valueNoLeverage}`);
                valueLeverage = valueNoLeverage = 1; // Reset to avoid propagating errors
            }
        }

        simulations.push({ date: rawData[i].date, value: valueLeverage });
        simulationsNoLeverage.push({ date: rawData[i].date, value: valueNoLeverage });
    }

    console.log('Simulations:', simulations);
    console.log('Simulations No Leverage:', simulationsNoLeverage);

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