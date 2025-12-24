from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from database.connection import Base
import uuid


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="dept_admin")
    department = Column(String, nullable=True)


class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4())[:8])
    category = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    department = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Submitted")
    image_url = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
