# S&P Leverage Simulation

This web application simulates the effect of leverage on S&P 500 investments over time. It allows users to upload historical S&P 500 data, choose a starting point, adjust the leverage factor, and visualize the results.

## Features

- Load default S&P 500 historical data
- Upload custom CSV files with historical data
- Select a starting point for the simulation
- Adjust the leverage factor
- Visualize the simulation results with an interactive chart
- Compare leveraged and non-leveraged investment strategies

## Installation

1. Clone this repository or download the source code.
2. Open the `index.html` file in a web browser.

No additional installation steps are required as the application runs entirely in the browser.

## Usage

1. Open the application in a web browser.
2. (Optional) Upload a custom CSV file with S&P 500 historical data.
3. Choose a starting point from the dropdown menu.
4. Adjust the leverage factor using the slider.
5. Click the "Start Simulation" button to run the simulation and display the results.

## CSV File Format

The application expects CSV files to have the following format:

```csv
Date,Close,Open,High,Low
YYYY-MM-DD,xxxx.xx,xxxx.xx,xxxx.xx,xxxx.xx
```

Ensure that your CSV file follows this format for proper functionality.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- Chart.js Data Labels plugin

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This application is for educational and demonstration purposes only. It does not provide financial advice, and the simulations should not be used as a basis for real-world investment decisions.