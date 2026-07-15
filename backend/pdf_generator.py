from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import sqlite3

def generate_student_report(student_id):
    filename = f"report_{student_id}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "UNIVERSITY ACADEMIC REPORT")
    c.setFont("Helvetica", 12)
    c.drawString(100, 730, f"Student ID: {student_id}")
    c.line(100, 720, 500, 720)

    # Database Data
    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.course_name, g.letter_grade, g.term 
        FROM grades g 
        JOIN courses c ON g.c_code = c.course_code 
        WHERE g.sid = ?
    ''', (student_id,))
    rows = cursor.fetchall()
    conn.close()

    # Content
    y = 680
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, y, "Course Name")
    c.drawString(300, y, "Grade")
    c.drawString(400, y, "Semester")
    
    c.setFont("Helvetica", 12)
    for name, grade, term in rows:
        y -= 20
        c.drawString(100, y, name)
        c.drawString(300, y, grade)
        c.drawString(400, y, term)

    c.save()
    return filename