from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from backend.database import create_db_and_tables, get_session
from backend.models import (
    Gym, GymCreate,
    Student, StudentCreate, StudentUpdate,
    ScheduledClass, ScheduledClassCreate,
    Attendance, Payment
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database and SQLite WAL mode on startup
    create_db_and_tables()
    yield

app = FastAPI(
    title="GrrrAPP API",
    description="SaaS MVP for Martial Arts Gyms - Optimized for 1GB RAM",
    lifespan=lifespan
)

# Allow all origins for the MVP (tune this for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/")
def read_root():
    return {"message": "Welcome to GrrrAPP API backend!"}

# --- AUTH & MULTI-TENANT ENDPOINTS ---

class LoginRequest(BaseModel):
    role: str
    username: str
    password: str

@app.post("/api/gyms/register", response_model=Gym, tags=["Auth"])
def register_gym(*, session: Session = Depends(get_session), gym: GymCreate):
    existing = session.exec(select(Gym).where(Gym.admin_username == gym.admin_username)).first()
    if existing:
         raise HTTPException(status_code=400, detail="Usuário admin já existe")
    db_gym = Gym.model_validate(gym)
    session.add(db_gym)
    session.commit()
    session.refresh(db_gym)
    return db_gym

@app.post("/api/auth/login", tags=["Auth"])
def login(*, session: Session = Depends(get_session), req: LoginRequest):
    if req.role == 'admin':
        gym = session.exec(select(Gym).where(Gym.admin_username == req.username)).first()
        if not gym or gym.admin_password != req.password:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        return {"message": "Login concluído", "role": "admin", "gym_id": gym.id, "name": gym.name}
    else:
        student = session.exec(select(Student).where(Student.username == req.username)).first()
        if not student or student.password != req.password:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        return {"message": "Login concluído", "role": "student", "student_id": student.id, "gym_id": student.gym_id, "name": student.name}

# --- ALUNOS ENDPOINTS ---

@app.post("/api/students/", response_model=Student, tags=["Students"])
def create_student(*, session: Session = Depends(get_session), student: StudentCreate):
    # Deve incluir o gym_id pertencente à academia
    db_student = Student.model_validate(student)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

@app.get("/api/students/gym/{gym_id}", response_model=List[Student], tags=["Students"])
def read_students(*, session: Session = Depends(get_session), gym_id: int):
    students = session.exec(select(Student).where(Student.gym_id == gym_id)).all()
    return students

# --- AGENDA ENDPOINTS ---

@app.post("/api/classes/", response_model=ScheduledClass, tags=["Schedule"])
def create_class(*, session: Session = Depends(get_session), scheduled_class: ScheduledClassCreate):
    db_class = ScheduledClass.model_validate(scheduled_class)
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    return db_class

@app.get("/api/classes/gym/{gym_id}", response_model=List[ScheduledClass], tags=["Schedule"])
def read_classes(*, session: Session = Depends(get_session), gym_id: int):
    classes = session.exec(select(ScheduledClass).where(ScheduledClass.gym_id == gym_id)).all()
    return classes

# --- CHECK-IN ENDPOINTS MOCK ---

@app.post("/api/check-in/", tags=["Check-in"])
def student_check_in(*, session: Session = Depends(get_session), student_id: int, qr_code_token: str):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.is_active:
        raise HTTPException(status_code=400, detail="Student is not active")
    return {"message": "Check-in successful", "student": student.name, "token_used": qr_code_token}

