from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ForecastHistory(Base):
    __tablename__ = "forecast_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    model_name: Mapped[str] = mapped_column(String(120), index=True)
    target: Mapped[str] = mapped_column(String(120))
    rmse: Mapped[float] = mapped_column(Float)
    mae: Mapped[float] = mapped_column(Float)
    r2: Mapped[float] = mapped_column(Float)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
