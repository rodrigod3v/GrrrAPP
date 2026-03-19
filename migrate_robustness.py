import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect("grrrapp.db")
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    tables = [
        ("gym", ["is_deleted BOOLEAN DEFAULT 0", f"created_at DATETIME DEFAULT '{now}'", f"updated_at DATETIME DEFAULT '{now}'"]),
        ("student", ["is_deleted BOOLEAN DEFAULT 0", f"created_at DATETIME DEFAULT '{now}'", f"updated_at DATETIME DEFAULT '{now}'"]),
        ("scheduledclass", ["is_deleted BOOLEAN DEFAULT 0", f"created_at DATETIME DEFAULT '{now}'"])
    ]
    
    for table, columns in tables:
        for col in columns:
            col_name = col.split()[0]
            try:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col}")
                print(f"Added column {col_name} to table {table}")
            except sqlite3.OperationalError:
                print(f"Column {col_name} already exists in table {table}")
    
    conn.commit()
    conn.close()
    print("Robustness migration complete!")

if __name__ == "__main__":
    migrate()
