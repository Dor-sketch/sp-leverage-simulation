import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
import dash
from dash import dcc, html
from dash.dependencies import Input, Output

def fetch_historical_data(ticker, start_date, end_date):
    stock = yf.Ticker(ticker)
    df = stock.history(start=start_date, end=end_date)
    return df

def run_simulation(data, multiplier=3):
    simulated_data = data.copy()
    simulated_data['Simulated Close'] = simulated_data['Close']

    for i in range(1, len(simulated_data)):
        change = simulated_data['Close'][i] - simulated_data['Close'][i-1]
        if change != 0:
            simulated_change = change * multiplier
            simulated_data.loc[simulated_data.index[i], 'Simulated Close'] = \
                simulated_data['Simulated Close'][i-1] + simulated_change

    return simulated_data

# Initialize the Dash app
app = dash.Dash(__name__)

# Define the layout
app.layout = html.Div([
    html.H1("Stock Price Simulation Dashboard"),

    dcc.Input(id="ticker-input", type="text", placeholder="Enter stock ticker", value="AAPL"),
    dcc.DatePickerRange(
        id='date-range',
        start_date='2020-01-01',
        end_date='2024-07-31'
    ),
    html.Button('Run Simulation', id='run-simulation-button'),

    dcc.Graph(id='stock-graph')
])

@app.callback(
    Output('stock-graph', 'figure'),
    [Input('run-simulation-button', 'n_clicks')],
    [dash.dependencies.State('ticker-input', 'value'),
     dash.dependencies.State('date-range', 'start_date'),
     dash.dependencies.State('date-range', 'end_date')]
)
def update_graph(n_clicks, ticker, start_date, end_date):
    if n_clicks is None:
        return go.Figure()

    df = fetch_historical_data(ticker, start_date, end_date)
    simulated_df = run_simulation(df)

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df.index, y=df['Close'], name='Actual Close'))
    fig.add_trace(go.Scatter(x=simulated_df.index, y=simulated_df['Simulated Close'], name='Simulated Close'))

    fig.update_layout(title=f'{ticker} Stock Price - Actual vs Simulated',
                      xaxis_title='Date',
                      yaxis_title='Price')

    return fig

if __name__ == '__main__':
    app.run_server(debug=True)