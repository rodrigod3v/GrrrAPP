
from backend.database import engine
from sqlmodel import Session, select
from backend.models import Gym, Student
from backend.auth import get_password_hash

def migrate():
    with Session(engine) as session:
        # Migrate Gyms
        gyms = session.exec(select(Gym)).all()
        for gym in gyms:
            if not gym.admin_password.startswith("$2b$"): # Simple check if already hashed
                print(f"Hashing password for gym admin: {gym.admin_username}")
                gym.admin_password = get_password_hash(gym.admin_password)
                session.add(gym)
        
        # Migrate Students
        students = session.exec(select(Student)).all()
        for student in students:
            if not student.password.startswith("$2b$"):
                print(f"Hashing password for student: {student.username}")
                student.password = get_password_hash(student.password)
                session.add(student)
        
        session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
