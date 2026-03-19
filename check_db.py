
from backend.database import engine
from sqlmodel import Session, select
from backend.models import Gym, Student, Attendance

with Session(engine) as session:
    gyms = session.exec(select(Gym)).all()
    print(f"Gyms: {[(g.admin_username, g.admin_password) for g in gyms]}")
    students = session.exec(select(Student)).all()
    print(f"Students: {[(s.username, s.password) for s in students]}")
    attendances = session.exec(select(Attendance)).all()
    print(f"Attendances count: {len(attendances)}")
