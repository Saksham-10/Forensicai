from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI LOGIC ---
def run_isolation_forest(df, sensitivity=50):
    contamination = 0.01 + (sensitivity / 100) * 0.19
    
    df['Returns'] = df['Close'].pct_change()
    df['Vol_Change'] = df['Volume'].pct_change()
    df['VWAP'] = (df['Close'] * df['Volume']).cumsum() / df['Volume'].cumsum()
    df['VWAP_Deviation'] = (df['Close'] - df['VWAP']) / df['VWAP']

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df = df.dropna()

    if len(df) < 10: return df, 0

    model_data = df[['Returns', 'Vol_Change', 'VWAP_Deviation']].values
    iso_forest = IsolationForest(n_estimators=100, contamination=contamination, random_state=42)
    df['Anomaly'] = iso_forest.fit_predict(model_data)
    
    return df, int((df['Anomaly'] == -1).sum())

def generate_expert_explanation(ticker, risk_score, anomaly_count, total_points, prices):
    """
    Synthetic AI Analyst: Generates a text report based on data patterns.
    """
    # 1. Analyze Trend
    start_price = prices[0]
    end_price = prices[-1]
    return_pct = ((end_price - start_price) / start_price) * 100
    trend = "Bullish (Upward)" if return_pct > 0 else "Bearish (Downward)"
    
    # 2. Determine Severity
    if risk_score > 75:
        severity = "CRITICAL"
        action = "Immediate Investigation Required"
        tone = "highly suspicious"
    elif risk_score > 40:
        severity = "HIGH"
        action = "Monitor Closely"
        tone = "irregular"
    else:
        severity = "LOW"
        action = "No Action Needed"
        tone = "stable"

    # 3. Construct Narrative
    report = f"### Forensic Analysis for {ticker}\n\n"
    report += f"**Risk Assessment:** {severity} ({risk_score}/100)\n"
    report += f"**Market Trend:** {trend} ({return_pct:.2f}% change)\n\n"
    
    report += f"**AI Observation:**\n"
    if risk_score < 20:
        report += f"The system analyzed {total_points} data points and found minimal deviations. "
        report += f"Trading behavior is consistent with normal market liquidity. "
        report += f"The {anomaly_count} detected anomalies are likely standard volatility noise rather than manipulation."
    elif risk_score > 75:
        report += f"⚠️ **ALERT:** {ticker} is exhibiting {tone} trading patterns. "
        report += f"The model detected {anomaly_count} significant anomalies, clustering around sharp price moves. "
        report += f"This divergence between Price and Volume (VWAP) strongly suggests artificial order flow or a potential '{'Pump and Dump' if return_pct > 0 else 'Panic Sell'}' scenario."
    else:
        report += f"The stock is showing some {tone} volatility. "
        report += f"While {anomaly_count} anomalies were flagged, they do not yet form a conclusive manipulation pattern. "
        report += f"However, the volume spikes during the {trend} trend warrant caution."

    return report

def process_request(data, ticker, sensitivity, explain=False):
    if data.empty: raise HTTPException(status_code=404, detail="No data")
    
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)
    
    df = data.reset_index()
    if 'Date' in df.columns: df.rename(columns={'Date': 'Datetime'}, inplace=True)
    if 'index' in df.columns: df.rename(columns={'index': 'Datetime'}, inplace=True)
    if 'Close' not in df.columns:
        if 'Adj Close' in df.columns: df['Close'] = df['Adj Close']
        else: df['Close'] = df.iloc[:, 1]

    df['Volume'] = df['Volume'].replace(0, 1)
    df['Close'] = df['Close'].ffill()

    analyzed_df, anomaly_count = run_isolation_forest(df, sensitivity)

    # Calculate Risk Score
    risk_score = min(int((anomaly_count / len(df)) * 100 * 2.5), 99) if len(df) > 0 else 0
    
    response = {
        "ticker": ticker,
        "total_points": int(len(analyzed_df)),
        "anomaly_count": anomaly_count,
        "risk_score": risk_score,
        "prices": analyzed_df['Close'].round(2).tolist(),
        "timestamps": analyzed_df['Datetime'].astype(str).tolist(),
        "anomalies": analyzed_df['Anomaly'].tolist()
    }

    # Only generate text if asked (saves time)
    if explain:
        response["explanation"] = generate_expert_explanation(
            ticker, risk_score, anomaly_count, len(df), response["prices"]
        )

    return response

# --- ENDPOINTS ---

@app.get("/analyze")
def analyze_ticker(ticker: str, sensitivity: int = Query(50)):
    print(f"--- LIVE SCAN: {ticker} ---")
    try:
        data = yf.download(ticker, period="5d", interval="5m", progress=False, auto_adjust=True)
        return process_request(data, ticker, sensitivity)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/deep-scan")
def deep_scan_ticker(ticker: str, sensitivity: int = Query(50)):
    print(f"--- DEEP SCAN: {ticker} ---")
    try:
        data = yf.download(ticker, period="2y", interval="1d", progress=False, auto_adjust=True)
        return process_request(data, ticker, sensitivity)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/explain")
def explain_ticker(ticker: str, sensitivity: int = Query(50)): # <--- NEW ENDPOINT
    print(f"--- EXPLAINING: {ticker} ---")
    try:
        data = yf.download(ticker, period="5d", interval="5m", progress=False, auto_adjust=True)
        # Reuse process_request but force 'explain=True'
        return process_request(data, ticker, sensitivity, explain=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)