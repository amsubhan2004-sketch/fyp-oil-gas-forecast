export const productionSeries = [
  { month: "Jan", production: 1000, forecast: 980 },
  { month: "Feb", production: 960, forecast: 945 },
  { month: "Mar", production: 930, forecast: 915 },
  { month: "Apr", production: 900, forecast: 890 },
  { month: "May", production: 870, forecast: 860 },
  { month: "Jun", production: 840, forecast: 830 },
  { month: "Jul", production: 810, forecast: 800 },
  { month: "Aug", production: 790, forecast: 775 },
  { month: "Sep", production: 760, forecast: 748 },
  { month: "Oct", production: 740, forecast: 726 },
  { month: "Nov", production: 715, forecast: 702 },
  { month: "Dec", production: 690, forecast: 676 },
];

export const modelMetrics = [
  { model: "Linear Regression", rmse: 14.2, mae: 11.1, r2: 0.89 },
  { model: "Random Forest", rmse: 10.3, mae: 8.9, r2: 0.93 },
  { model: "LSTM", rmse: 9.8, mae: 8.1, r2: 0.95 },
  { model: "Decline Curve", rmse: 12.5, mae: 10.6, r2: 0.9 },
];
