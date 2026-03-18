from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from backend.database import create_db_and_tables, get_session
from backend.models import (
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

# --- ALUNOS ENDPOINTS ---

@app.post("/api/students/", response_model=Student, tags=["Students"])
def create_student(*, session: Session = Depends(get_session), student: StudentCreate):
    db_student = Student.model_validate(student)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

@app.get("/api/students/", response_model=List[Student], tags=["Students"])
def read_students(*, session: Session = Depends(get_session), offset: int = 0, limit: int = Query(default=100, le=100)):
    students = session.exec(select(Student).offset(offset).limit(limit)).all()
    return students

@app.get("/api/students/{student_id}", response_model=Student, tags=["Students"])
def read_student(*, session: Session = Depends(get_session), student_id: int):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.patch("/api/students/{student_id}", response_model=Student, tags=["Students"])
def update_student(*, session: Session = Depends(get_session), student_id: int, student: StudentUpdate):
    db_student = session.get(Student, student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data = student.model_dump(exclude_unset=True)
    for key, value in student_data.items():
        setattr(db_student, key, value)
        
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

# --- AGENDA ENDPOINTS ---

@app.post("/api/classes/", response_model=ScheduledClass, tags=["Schedule"])
def create_class(*, session: Session = Depends(get_session), scheduled_class: ScheduledClassCreate):
    db_class = ScheduledClass.model_validate(scheduled_class)
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    return db_class

@app.get("/api/classes/", response_model=List[ScheduledClass], tags=["Schedule"])
def read_classes(*, session: Session = Depends(get_session)):
    classes = session.exec(select(ScheduledClass)).all()
    return classes

# --- CHECK-IN ENDPOINTS MOCK ---

@app.post("/api/check-in/", tags=["Check-in"])
def student_check_in(*, session: Session = Depends(get_session), student_id: int, qr_code_token: str):
    # Mocking QR Code dynamic validation
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if not student.is_active:
        raise HTTPException(status_code=400, detail="Student is not active")

    return {"message": "Check-in successful", "student": student.name, "token_used": qr_code_token}

# --- FINANCEIRO ENDPOINTS MOCK ---

@app.get("/api/payments/student/{student_id}", tags=["Financial"])
def read_student_payments(*, session: Session = Depends(get_session), student_id: int):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    payments = session.exec(select(Payment).where(Payment.student_id == student_id)).all()
    return {"student_id": student.id, "payments": payments}
