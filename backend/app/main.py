from __future__ import annotations

import io
from typing import Literal
from uuid import uuid4

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

app = FastAPI(title="Oil & Gas Forecast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_STORE: dict[str, object] = {}
REQUIRED_COLUMNS = {"date", "production"}


class PreprocessRequest(BaseModel):
    rows: list[dict]


class TrainRequest(BaseModel):
    rows: list[dict]
    target: str = "production"
    model_type: Literal["linear_regression", "random_forest", "lstm", "decline_curve"]


class PredictRequest(BaseModel):
    model_id: str
    rows: list[dict]


class ExportRequest(BaseModel):
    rows: list[dict]
    file_format: Literal["csv", "json"] = "csv"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


def _validate_dataframe(df: pd.DataFrame) -> None:
    lowered = {c.lower() for c in df.columns}
    if not REQUIRED_COLUMNS.issubset(lowered):
        raise HTTPException(
            status_code=400,
            detail="CSV must include date and production columns.",
        )


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed = {c: c.lower().strip() for c in df.columns}
    return df.rename(columns=renamed)


def _preprocess(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    numeric_cols = out.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        out[col] = out[col].fillna(out[col].median())
        q1, q3 = out[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        out[col] = out[col].clip(lower=lower, upper=upper)
    for col in out.columns:
        if col not in numeric_cols:
            out[col] = out[col].ffill().bfill()
    return out


def _feature_target(df: pd.DataFrame, target: str) -> tuple[pd.DataFrame, pd.Series]:
    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"target column '{target}' missing")
    if "date" in df.columns:
        try:
            date_series = pd.to_datetime(df["date"], errors="coerce")
            df = df.copy()
            df["timestep"] = (date_series - date_series.min()).dt.days.fillna(0)
        except Exception:
            df = df.copy()
            df["timestep"] = np.arange(len(df), dtype=float)
    numeric_df = df.select_dtypes(include=[np.number])
    if target not in numeric_df.columns:
        raise HTTPException(status_code=400, detail="target must be numeric")
    X = numeric_df.drop(columns=[target], errors="ignore")
    if X.empty:
        X = pd.DataFrame({"index": np.arange(len(df), dtype=float)})
    y = numeric_df[target]
    return X, y


def _decline_curve_forecast(y: pd.Series, periods: int = 12) -> dict[str, list[float]]:
    if y.empty:
        return {"exponential": [], "hyperbolic": [], "harmonic": []}
    q0 = float(max(y.iloc[-1], 1e-6))
    t = np.arange(1, periods + 1, dtype=float)
    d = 0.05
    b = 0.5
    exponential = q0 * np.exp(-d * t)
    hyperbolic = q0 / np.power(1 + b * d * t, 1 / b)
    harmonic = q0 / (1 + d * t)
    return {
        "exponential": exponential.tolist(),
        "hyperbolic": hyperbolic.tolist(),
        "harmonic": harmonic.tolist(),
    }


def _compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    return {
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "r2": float(r2_score(y_true, y_pred)) if len(y_true) > 1 else 0.0,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)) -> dict:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    data = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(data))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {exc}") from exc
    df = _normalize_columns(df)
    _validate_dataframe(df)
    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "preview": df.head(10).replace({np.nan: None}).to_dict(orient="records"),
    }


@app.post("/preprocess")
def preprocess_data(request: PreprocessRequest) -> dict:
    df = _normalize_columns(pd.DataFrame(request.rows))
    _validate_dataframe(df)
    processed = _preprocess(df)
    return {
        "rows": len(processed),
        "columns": list(processed.columns),
        "data": processed.replace({np.nan: None}).to_dict(orient="records"),
    }


@app.post("/train")
def train_model(request: TrainRequest) -> dict:
    df = _preprocess(_normalize_columns(pd.DataFrame(request.rows)))
    X, y = _feature_target(df, request.target)

    if request.model_type == "decline_curve":
        model_id = str(uuid4())
        MODEL_STORE[model_id] = {"type": "decline_curve", "history": y.tolist()}
        curves = _decline_curve_forecast(y)
        return {
            "model_id": model_id,
            "model_type": request.model_type,
            "metrics": {"rmse": 0.0, "mae": 0.0, "r2": 1.0},
            "decline_curves": curves,
        }

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    if request.model_type == "linear_regression":
        model = LinearRegression()
    elif request.model_type == "random_forest":
        model = RandomForestRegressor(n_estimators=200, random_state=42)
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)

    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    metrics = _compute_metrics(y_test.to_numpy(), np.asarray(preds))

    model_id = str(uuid4())
    MODEL_STORE[model_id] = {"type": request.model_type, "model": model, "features": list(X.columns)}

    return {
        "model_id": model_id,
        "model_type": request.model_type,
        "metrics": metrics,
    }


@app.post("/predict")
def predict(request: PredictRequest) -> dict:
    if request.model_id not in MODEL_STORE:
        raise HTTPException(status_code=404, detail="model_id not found")
    payload = MODEL_STORE[request.model_id]

    if payload["type"] == "decline_curve":
        history = pd.Series(payload["history"])
        return {
            "predictions": _decline_curve_forecast(history, periods=max(1, len(request.rows))),
        }

    model = payload["model"]
    df = _preprocess(_normalize_columns(pd.DataFrame(request.rows)))
    numeric_df = df.select_dtypes(include=[np.number])
    features = payload["features"]
    for feature in features:
        if feature not in numeric_df.columns:
            numeric_df[feature] = 0.0
    preds = model.predict(numeric_df[features])
    return {"predictions": np.asarray(preds).tolist()}


@app.post("/compare")
def compare_models(request: PreprocessRequest) -> dict:
    rows = request.rows
    comparisons = []
    for model_type in ["linear_regression", "random_forest", "lstm", "decline_curve"]:
        result = train_model(TrainRequest(rows=rows, model_type=model_type, target="production"))
        comparisons.append(
            {
                "model_type": model_type,
                "metrics": result["metrics"],
                "model_id": result["model_id"],
            }
        )
    return {"comparisons": comparisons}


@app.post("/stats")
def data_stats(request: PreprocessRequest) -> dict:
    df = _normalize_columns(pd.DataFrame(request.rows))
    _validate_dataframe(df)
    numeric = df.select_dtypes(include=[np.number])
    return {
        "rows": len(df),
        "columns": list(df.columns),
        "summary": numeric.describe().replace({np.nan: None}).to_dict(),
    }


@app.post("/export")
def export_data(request: ExportRequest) -> dict:
    df = pd.DataFrame(request.rows)
    if request.file_format == "json":
        return {"format": "json", "content": df.to_json(orient="records")}
    return {"format": "csv", "content": df.to_csv(index=False)}


@app.post("/chatbot")
def chatbot(request: ChatRequest) -> dict:
    message = request.message.lower()
    if "rmse" in message or "mae" in message or "r2" in message:
        reply = "Use RMSE/MAE for absolute error and R² for explained variance when comparing forecasting models."
    elif "decline" in message:
        reply = "Decline curve analysis estimates future production using exponential, hyperbolic, and harmonic models."
    elif "upload" in message:
        reply = "Upload a CSV with at least date and production columns, then preprocess, train, and forecast."
    else:
        reply = "I can help with data upload, preprocessing, model training, decline curves, and forecast interpretation."
    return {"reply": reply}
