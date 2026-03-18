from datetime import date, datetime, time
from typing import Optional
from sqlmodel import Field, SQLModel

# -- MÓDULO DE ALUNOS --
class StudentBase(SQLModel):
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    photo_url: Optional[str] = None
    belt: str = Field(default="Branca")
    degree: int = Field(default=0)
    is_active: bool = Field(default=True)

class Student(StudentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    belt: Optional[str] = None
    degree: Optional[int] = None
    is_active: Optional[bool] = None

# -- AGENDA DE TREINOS --
class ScheduledClassBase(SQLModel):
    modality: str = Field(index=True) # e.g., BJJ, Muay Thai, Wrestling
    day_of_week: int # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    capacity: int = Field(default=30)

class ScheduledClass(ScheduledClassBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ScheduledClassCreate(ScheduledClassBase):
    pass

# -- CHECK-IN INTELIGENTE --
class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    class_id: int = Field(foreign_key="scheduledclass.id")
    check_in_time: datetime = Field(default_factory=datetime.utcnow)
    qr_code_token: str

# -- MÓDULO FINANCEIRO --
class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    amount: float
    due_date: date
    status: str = Field(default="Pending") # Pending, Paid, Overdue
    payment_method: str # Pix, Boleto
    gateway_ref: Optional[str] = None
    pix_emv: Optional[str] = None # Copia e cola payload
