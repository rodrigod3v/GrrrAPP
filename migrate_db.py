
import sqlite3
from datetime import datetime

conn = sqlite3.connect('grrrapp.db')
cursor = conn.cursor()

# Check if target_date exists, add if not (manual migration for SQLite)
try:
    cursor.execute("ALTER TABLE attendance ADD COLUMN target_date DATE")
    print("Added target_date column.")
except sqlite3.OperationalError:
    print("Column target_date already exists.")

# Update NULL target_date from check_in_time
cursor.execute("""
    UPDATE attendance 
    SET target_date = substr(check_in_time, 1, 10) 
    WHERE target_date IS NULL
""")
print(f"Updated {cursor.rowcount} rows with target_date.")

conn.commit()
conn.close()
