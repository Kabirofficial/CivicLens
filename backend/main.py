import io
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_
from jose import JWTError, jwt
from PIL import Image
from ultralytics import YOLO
from pydantic import BaseModel

from database.connection import engine, Base, get_db
from database.schemas import User, Report
from core.security import verify_password, get_password_hash, create_access_token
from core.logic import (
    calculate_distance,
    assign_department,
    get_location_details,
    DEPT_ROADS,
    DEPT_WASTE,
)
from core.config import settings

app = FastAPI(title="CivicLens Professional API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
MODEL_PATH = "models/best.pt"


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    global model
    try:
        model = YOLO(MODEL_PATH)
    except Exception:
        pass

    from database.connection import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.username == settings.SUPER_ADMIN_USER)
        )
        if not result.scalars().first():
            super_admin = User(
                username=settings.SUPER_ADMIN_USER,
                hashed_password=get_password_hash(settings.SUPER_ADMIN_PASS),
                role="super_admin",
                department=None,
            )
            db.add(super_admin)
            await db.commit()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=401)
    return user


@app.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400)

    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "department": user.department,
    }


class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str = "dept_admin"
    department: str


class UpdateUserRequest(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None


@app.get("/admin/users")
async def get_all_users(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403)

    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {"username": u.username, "role": u.role, "department": u.department}
        for u in users
    ]


@app.post("/admin/create-user")
async def create_municipal_user(
    new_user: CreateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403)

    result = await db.execute(select(User).where(User.username == new_user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username exists")

    db_user = User(
        username=new_user.username,
        hashed_password=get_password_hash(new_user.password),
        role=new_user.role,
        department=new_user.department,
    )
    db.add(db_user)
    await db.commit()
    return {"message": "User created"}


@app.delete("/admin/user/{username}")
async def delete_user(
    username: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403)

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}


@app.patch("/admin/user/{username}")
async def update_user(
    username: str,
    update_data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403)

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.password:
        user.hashed_password = get_password_hash(update_data.password)
    if update_data.role:
        user.role = update_data.role
    if update_data.department:
        user.department = update_data.department

    await db.commit()
    return {"message": "User updated"}


@app.post("/report")
async def submit_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not model:
        raise HTTPException(500)

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        results = model.predict(image, conf=0.25)
    except:
        raise HTTPException(400)

    detected_issue = None
    max_conf = 0.0
    VALID_CLASSES = ["pothole", "overflowing", "garbage_pile", "full"]

    for box in results[0].boxes:
        cls_name = model.names[int(box.cls[0])]
        conf = float(box.conf[0])
        if cls_name in VALID_CLASSES and conf > max_conf:
            max_conf = conf
            detected_issue = cls_name

    if not detected_issue:
        return {"status": "rejected"}

    cutoff_time = datetime.utcnow() - timedelta(days=7)
    stmt = select(Report).where(
        Report.category == detected_issue, Report.timestamp >= cutoff_time
    )
    history = await db.execute(stmt)

    for old_report in history.scalars():
        dist = calculate_distance(
            latitude, longitude, old_report.latitude, old_report.longitude
        )
        if dist <= 100:
            return {
                "status": "duplicate",
                "original_id": old_report.id,
                "issue": detected_issue,
                "assigned_to": old_report.department,
                "location": {
                    "city": old_report.city,
                    "state": old_report.state,
                    "lat": old_report.latitude,
                    "lon": old_report.longitude,
                },
            }

    full_address, city, state = get_location_details(latitude, longitude)
    dept = assign_department(detected_issue)

    new_report = Report(
        category=detected_issue,
        latitude=latitude,
        longitude=longitude,
        department=dept,
        address=full_address,
        city=city,
        state=state,
    )
    db.add(new_report)
    await db.commit()

    return {
        "status": "success",
        "report_id": new_report.id,
        "issue": detected_issue,
        "location": {"city": city, "state": state, "lat": latitude, "lon": longitude},
        "assigned_to": dept,
    }


class StatusUpdate(BaseModel):
    status: str


@app.patch("/admin/report/{report_id}/status")
async def update_report_status(
    report_id: str,
    update: StatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()

    if not report:
        raise HTTPException(404, "Report not found")

    report.status = update.status
    await db.commit()
    return {"message": "Status updated"}


@app.get("/admin/reports")
async def get_all_reports(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stmt = select(Report).order_by(Report.timestamp.desc())

    if current_user.role == "dept_admin":
        if current_user.department:
            stmt = stmt.where(Report.department == current_user.department)

    result = await db.execute(stmt)
    return result.scalars().all()


@app.get("/public/nearby")
async def get_nearby_reports(
    lat: float, lon: float, radius: float = 1000, db: AsyncSession = Depends(get_db)
):
    stmt = select(Report).order_by(Report.timestamp.desc())
    result = await db.execute(stmt)
    all_reports = result.scalars().all()

    nearby = []
    for report in all_reports:
        dist = calculate_distance(lat, lon, report.latitude, report.longitude)
        if dist <= radius:
            nearby.append(report)

    return nearby
