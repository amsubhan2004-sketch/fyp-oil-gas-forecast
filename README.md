# FYP Oil & Gas Forecasting Platform

A complete full-stack starter for oil & gas production forecasting with:

- **Frontend**: Next.js 16/TypeScript/Tailwind/Framer Motion/Recharts/Three.js/Remotion
- **Backend**: FastAPI + pandas + scikit-learn + decline-curve analysis endpoints
- **Data stack**: PostgreSQL + Redis (via Docker Compose)

## Project Structure

- `/frontend` - Next.js web app (dashboard, upload, chatbot, 3D view, Remotion player)
- `/backend` - FastAPI forecasting API with ML and DCA endpoints
- `/docker-compose.yml` - full local stack

## Backend API Endpoints

- `POST /upload` - CSV upload & validation
- `POST /preprocess` - cleaning, imputation, outlier clipping
- `POST /train` - train model (linear_regression, random_forest, lstm proxy, decline_curve)
- `POST /predict` - prediction endpoint
- `POST /compare` - compare model performance
- `POST /stats` - statistical summary
- `POST /export` - CSV/JSON export
- `POST /chatbot` - AI guidance endpoint
- `GET /health` - health check

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker

```bash
docker compose up --build
```

## Validation

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd backend
pytest -q
```

## Notes

- Framer Motion animations are used on the main dashboard.
- Remotion video preview is integrated via `@remotion/player`.
- Three.js (`@react-three/fiber`) powers 3D well visualization.
- API is ready for extension with TensorFlow/PyTorch and persistent model storage.
- Frontend uses `NEXT_PUBLIC_API_URL` (see `frontend/.env.example`) for backend endpoint configuration.
