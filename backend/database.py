# import sqlite3

# def setup_university_db():
#     conn = sqlite3.connect('university.db')
#     cursor = conn.cursor()
    
#     # 1. Create Courses Table
#     cursor.execute('''
#         CREATE TABLE IF NOT EXISTS courses (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             course_code TEXT UNIQUE,
#             course_name TEXT,
#             credits INTEGER,
#             department TEXT,
#             prerequisites TEXT
#         )
#     ''')

#     # 2. NEW: Faculty Table
#     cursor.execute('''
#         CREATE TABLE IF NOT EXISTS faculty (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             name TEXT,
#             email TEXT,
#             department TEXT,
#             office_hours TEXT
#         )
#     ''')

#     # 3. NEW: Student Grades Table (Mock data for 'student_01')
#     cursor.execute('''
#         CREATE TABLE IF NOT EXISTS grades (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             student_id TEXT,
#             course_code TEXT,
#             grade TEXT,
#             semester TEXT
#         )
#     ''')
    
#     # . Add sample academic data
#     sample_courses = [
#         ('CS101', 'Intro to Programming', 3, 'Computer Science', 'None'),
#         ('CS202', 'Data Structures', 4, 'Computer Science', 'CS101'),
#         ('CS305', 'Database Systems', 3, 'Computer Science', 'CS202'),
#         ('ENG101', 'Academic Writing', 3, 'Humanities', 'None'),
#         ('MATH201', 'Calculus II', 4, 'Mathematics', 'MATH101')
#     ]

#     # Add Sample Faculty
#     faculty_data = [
#         ('Dr. Smith', 'smith@uni.edu', 'Computer Science', 'Mon/Wed 2-4pm'),
#         ('Prof. Sarah', 'sarah@uni.edu', 'Mathematics', 'Tue 10am-12pm')
#     ]
    
#     # Add Sample Grades for our 'default' student
#     grade_data = [
#         ('student_01', 'CS101', 'A', 'Fall 2025'),
#         ('student_01', 'MATH201', 'B+', 'Fall 2025')
#     ]
    
#     try:
#         cursor.executemany('''
#             INSERT OR IGNORE INTO courses (course_code, course_name, credits, department, prerequisites) 
#             VALUES (?, ?, ?, ?, ?)
#         ''', sample_courses)

#         cursor.executemany('''
#         INSERT OR REPLACE INTO faculty (id, name, email, department, office_hours) 
#         VALUES (?, ?, ?, ?, ?)
#     ''', [
#         (1, 'Dr. Smith', 'smith@uni.edu', 'Computer Science', 'Mon/Wed 2-4pm'),
#         (2, 'Prof. Sarah', 'sarah@uni.edu', 'Mathematics', 'Tue 10am-12pm')
#     ])
#         cursor.executemany('''
#         INSERT OR REPLACE INTO grades (id, student_id, course_code, grade, semester) 
#         VALUES (?, ?, ?, ?, ?)
#     ''', [
#         (1, 'student_01', 'CS101', 'A', 'Fall 2025'),
#         (2, 'student_01', 'MATH201', 'B+', 'Fall 2025')
#     ])
        
#         conn.commit()
#         print("✅ Database 'university.db' created with sample courses!")
#     except Exception as e:
#         print(f"❌ Error: {e}")
#     finally:
#         conn.close()

# if __name__ == "__main__":
#     setup_university_db()


import sqlite3
import bcrypt

def hash_password(password: str) -> str:
    # Hash a password for the first time
    # (bcrypt handles the salt automatically)
    byte_pwd = password.encode('utf-8')
    pwd_hash = bcrypt.hashpw(byte_pwd, bcrypt.gensalt())
    return pwd_hash.decode('utf-8')

def reset_db():
    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    
    # Drop and Recreate to ensure no old "junk" data exists
    cursor.execute('DROP TABLE IF EXISTS courses')
    cursor.execute('DROP TABLE IF EXISTS faculty')
    cursor.execute('DROP TABLE IF EXISTS grades')
    cursor.execute('DROP TABLE IF EXISTS chat_sessions')
    cursor.execute('DROP TABLE IF EXISTS users')

    cursor.execute('''CREATE TABLE courses (
        course_id INTEGER PRIMARY KEY,
        course_code TEXT UNIQUE,
        course_name TEXT,
        credits INTEGER,
        department TEXT
    )''')

    cursor.execute('''CREATE TABLE faculty (
        faculty_id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        department TEXT,
        office_hours TEXT
    )''')

    cursor.execute('''CREATE TABLE grades (
        grade_id INTEGER PRIMARY KEY,
        sid TEXT, 
        c_code TEXT,
        letter_grade TEXT,
        term TEXT
    )''')

    cursor.execute('''CREATE TABLE chat_sessions (
        session_id TEXT PRIMARY KEY,
        owner_id INTEGER,
        title TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(owner_id) REFERENCES users(id)
    )''')

    cursor.execute('''CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT
    )''')

    raw_password = "student123" 

    hashed_password = hash_password(raw_password)

    cursor.execute(
        "INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)", 
        ("student_01", hashed_password, "John Doe")
    )

    # Seed data
    cursor.execute("INSERT INTO faculty (name, email, department, office_hours) VALUES ('Prof. Sarah', 'sarah@uni.edu', 'Mathematics', 'Tue 10am')")
    cursor.execute("INSERT INTO courses (course_code, course_name, credits, department) VALUES ('CS101', 'Intro to Programming', 3, 'Computer Science')")
    cursor.execute("INSERT INTO grades (sid, c_code, letter_grade, term) VALUES ('student_01', 'CS101', 'A', 'Fall 2025')")

    
    conn.commit()
    conn.close()

    print(" Database Reset Successful!")
    print("✅ History table initialized!")

if __name__ == "__main__":
    reset_db()
