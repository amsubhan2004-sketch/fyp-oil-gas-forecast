from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def sample_rows():
    return [
        {"date": "2024-01-01", "production": 1000, "pressure": 3200},
        {"date": "2024-02-01", "production": 950, "pressure": 3180},
        {"date": "2024-03-01", "production": 920, "pressure": 3150},
        {"date": "2024-04-01", "production": 890, "pressure": 3130},
        {"date": "2024-05-01", "production": 860, "pressure": 3110},
    ]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_preprocess_and_train_predict_flow():
    pre = client.post("/preprocess", json={"rows": sample_rows()})
    assert pre.status_code == 200
    data = pre.json()["data"]

    train = client.post(
        "/train",
        json={"rows": data, "target": "production", "model_type": "linear_regression"},
    )
    assert train.status_code == 200
    model_id = train.json()["model_id"]

    pred = client.post("/predict", json={"model_id": model_id, "rows": data})
    assert pred.status_code == 200
    assert len(pred.json()["predictions"]) == len(data)


def test_compare_models():
    response = client.post("/compare", json={"rows": sample_rows()})
    assert response.status_code == 200
    comparisons = response.json()["comparisons"]
    assert len(comparisons) == 4
