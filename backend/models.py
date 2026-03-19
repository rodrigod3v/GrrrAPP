from datetime import date, datetime, time
from typing import Optional
from sqlmodel import Field, SQLModel

# -- MÓDULO DE ACADEMIAS (MULTI-TENANT) --
class GymBase(SQLModel):
    name: str = Field(index=True)
    admin_email: str = Field(unique=True, index=True)
    admin_username: str = Field(unique=True, index=True)

class Gym(GymBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_password: str # Senha em texto pleno para o protótipo local rápido

class GymCreate(GymBase):
    admin_password: str

# -- MÓDULO DE ALUNOS --
class StudentBase(SQLModel):
    name: str = Field(index=True)
    email: Optional[str] = None
    username: str = Field(unique=True, index=True) # Used for Student Login
    photo_url: Optional[str] = None
    modality: str = Field(default="Jiu-Jitsu")
    belt: str = Field(default="Branca")
    degree: int = Field(default=0)
    is_active: bool = Field(default=True)
    gym_id: int = Field(foreign_key="gym.id", index=True)

class Student(StudentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password: str = Field(default="changeme") # Default password

class StudentCreate(StudentBase):
    password: Optional[str] = "changeme"

class StudentUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    belt: Optional[str] = None
    degree: Optional[int] = None
    is_active: Optional[bool] = None

# -- AGENDA DE TREINOS (SCHEDULE) --
class ScheduledClassBase(SQLModel):
    modality: str = Field(index=True) # e.g., BJJ, Muay Thai, Wrestling
    day_of_week: str # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    capacity: int = Field(default=30)
    gym_id: int = Field(foreign_key="gym.id", index=True)

class ScheduledClass(ScheduledClassBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ScheduledClassCreate(ScheduledClassBase):
    pass

# -- CHECK-IN INTELIGENTE --
class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    class_id: int = Field(foreign_key="scheduledclass.id")
    gym_id: int = Field(foreign_key="gym.id", index=True)
    check_in_time: datetime = Field(default_factory=datetime.utcnow)
    target_date: date = Field(index=True) # Explicit date of the class instance
    qr_code_token: str

# -- MÓDULO FINANCEIRO --
class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    gym_id: int = Field(foreign_key="gym.id", index=True)
    amount: float
    due_date: date
    status: str = Field(default="Pending") # Pending, Paid, Overdue
    payment_method: str # Pix, Boleto
    gateway_ref: Optional[str] = None
    pix_emv: Optional[str] = None # Copia e cola payload

# -- MÓDULO DE AVISOS (ANNOUNCEMENTS) --
class NoticeBase(SQLModel):
    title: str = Field(index=True)
    description: str
    type: str = Field(default="info") # info, warning, success, alert
    color: str = Field(default="#10b981")
    gym_id: int = Field(foreign_key="gym.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notice(NoticeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
