from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from datetime import datetime, time, date
from pydantic import BaseModel

from backend.database import create_db_and_tables, get_session
from backend.models import (
    Gym, GymCreate,
    Student, StudentCreate, StudentUpdate,
    ScheduledClass, ScheduledClassCreate, ScheduledClassBase,
    Attendance, Payment, Notice
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

# --- GRRR APP BACKEND --- 

class BatchClassCreate(BaseModel):
    modality: str
    days_of_week: List[str]
    start_time: time
    end_time: time
    capacity: int
    gym_id: int

@app.post("/api/classes/", response_model=ScheduledClass, tags=["Schedule"])
def create_class(*, session: Session = Depends(get_session), scheduled_class: ScheduledClassCreate):
    db_class = ScheduledClass.model_validate(scheduled_class)
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    return db_class

@app.post("/api/classes/batch", response_model=List[ScheduledClass], tags=["Schedule"])
def create_classes_batch(*, session: Session = Depends(get_session), batch: BatchClassCreate):
    created_classes = []
    for day in batch.days_of_week:
        db_class = ScheduledClass(
            modality=batch.modality,
            day_of_week=day,
            start_time=batch.start_time,
            end_time=batch.end_time,
            capacity=batch.capacity,
            gym_id=batch.gym_id
        )
        session.add(db_class)
        created_classes.append(db_class)
    session.commit()
    for c in created_classes:
        session.refresh(c)
    return created_classes

@app.get("/api/classes/gym/{gym_id}", response_model=List[ScheduledClass], tags=["Schedule"])
def read_classes(*, session: Session = Depends(get_session), gym_id: int):
    classes = session.exec(select(ScheduledClass).where(ScheduledClass.gym_id == gym_id)).all()
    return classes

@app.delete("/api/classes/{class_id}", tags=["Schedule"])
def delete_class(*, session: Session = Depends(get_session), class_id: int):
    db_class = session.get(ScheduledClass, class_id)
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    session.delete(db_class)
    session.commit()
    return {"message": "Aula removida com sucesso"}

# --- CHECK-IN & ATTENDANCE ENDPOINTS ---

@app.post("/api/check-in/", tags=["Check-in"])
def student_check_in(
    *, 
    session: Session = Depends(get_session), 
    student_id: int, 
    class_id: int, 
    gym_id: int, 
    qr_code_token: str,
    target_date: date = None
):
    if not target_date:
        target_date = date.today()
    
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.is_active:
        raise HTTPException(status_code=400, detail="Student is not active")
        
    # Validation: Already checked in for this specific class on this date?
    existing = session.exec(
        select(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.class_id == class_id,
            Attendance.target_date == target_date
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Você já realizou check-in para esta aula.")

    # Optional: verify if class exists and belongs to the gym
    scheduled_class = session.get(ScheduledClass, class_id)
    if not scheduled_class or scheduled_class.gym_id != gym_id:
        raise HTTPException(status_code=404, detail="Class not found for this gym")

    attendance = Attendance(
        student_id=student_id,
        class_id=class_id,
        gym_id=gym_id,
        target_date=target_date,
        qr_code_token=qr_code_token,
        check_in_time=datetime.now()
    )
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    
    return {"message": "Check-in successful", "student": student.name, "class": scheduled_class.modality}

@app.get("/api/attendance/gym/{gym_id}", tags=["Check-in"])
def get_gym_attendance(*, session: Session = Depends(get_session), gym_id: int):
    # Fetch recent attendances join Student and Class
    stmt = (
        select(Attendance, Student, ScheduledClass)
        .join(Student, Attendance.student_id == Student.id)
        .join(ScheduledClass, Attendance.class_id == ScheduledClass.id)
        .where(Attendance.gym_id == gym_id)
        .order_by(Attendance.check_in_time.desc())
        .limit(20)
    )
    results = session.exec(stmt).all()
    
    attendance_list = []
    for attendance, student, scheduled_class in results:
        attendance_list.append({
            "id": attendance.id,
            "student_name": student.name,
            "modality": scheduled_class.modality,
            "check_in_time": attendance.check_in_time,
            "student_belt": student.belt
        })
    return attendance_list
@app.get("/api/attendance/student/{student_id}/summary", tags=["Check-in"])
def get_student_attendance_summary(*, session: Session = Depends(get_session), student_id: int):
    # Count total attendances for this student
    count = session.exec(select(Attendance).where(Attendance.student_id == student_id)).all()
    return {"count": len(count)}

@app.get("/api/attendance/student/{student_id}/history", tags=["Check-in"])
def get_student_attendance_history(*, session: Session = Depends(get_session), student_id: int):
    # Join Attendance with ScheduledClass to get modality and times
    results = session.exec(
        select(Attendance, ScheduledClass)
        .join(ScheduledClass, Attendance.class_id == ScheduledClass.id)
        .where(Attendance.student_id == student_id)
        .order_by(Attendance.check_in_time.desc())
        .limit(20) # Latest 20 check-ins
    ).all()
    
    history_list = []
    for attendance, scheduled_class in results:
        history_list.append({
            "id": attendance.id,
            "modality": scheduled_class.modality,
            "check_in_time": attendance.check_in_time,
            "target_date": attendance.target_date
        })
    return history_list

# --- ANNOUNCEMENTS (NOTICES) ENDPOINTS ---

@app.post("/api/notices/", tags=["Notices"])
def create_notice(*, session: Session = Depends(get_session), notice: Notice):
    session.add(notice)
    session.commit()
    session.refresh(notice)
    return notice

@app.get("/api/notices/gym/{gym_id}", tags=["Notices"])
def get_notices(*, session: Session = Depends(get_session), gym_id: int):
    return session.exec(select(Notice).where(Notice.gym_id == gym_id).order_by(Notice.created_at.desc())).all()

@app.delete("/api/notices/{notice_id}", tags=["Notices"])
def delete_notice(*, session: Session = Depends(get_session), notice_id: int):
    notice = session.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    session.delete(notice)
    session.commit()
    return {"message": "Notice deleted"}
