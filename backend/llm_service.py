import os
from openai import OpenAI
from groq import Groq
import google.generativeai as genai
from dotenv import load_dotenv
import sqlite3

load_dotenv()

class LLMService:
    def __init__(self, provider="groq"):
        self.provider = provider
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # 1. Setup Gemini
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            genai.configure(api_key=gemini_key)
            try:
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
            except:
                self.gemini_model = genai.GenerativeModel('models/gemini-1.5-flash')
        
        # 2. Setup OpenAI (Cloud)
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # 3. Setup LM Studio (Local)
        # LM Studio needs a 'base_url' but still requires a dummy api_key
        self.local_client = OpenAI(
            base_url="http://localhost:1234/v1", 
            api_key="lm-studio" 
        )

    def query_database(self, sql_query):
        clean_sql = sql_query.strip().rstrip(';').rstrip(')') + ';'
        try:
            print(f"DEBUG: Executing SQL -> {clean_sql}")
            conn = sqlite3.connect('university.db')
            cursor = conn.cursor()
            cursor.execute(clean_sql)
            results = cursor.fetchall()
            conn.close()
            
            if not results:
                return "No matching records found. (Check if names or codes are exact)."
            return str(results)
        except Exception as e:
            print(f"DEBUG: SQL Error -> {e}")
            return f"Database Error: {e}"

    def generate_response(self, question, context, history):
        # 1. Prepare history and check if we need SQL
        formatted_history = "\n".join([f"{m['role']}: {m['content']}" for m in history[-5:]])

        # This is the 'Router' prompt to see if we need the Database
        intent_prompt = f"""
        USER QUESTION: {question}
        
        DATABASE SCHEMA (SQLite):
        1. courses(course_code, course_name, credits, department)
        2. faculty(name, email, department, office_hours)
        3. grades(sid, c_code, letter_grade, term)
        
        CURRENT STUDENT ID: 'student_01'

        RULES:
        - Output ONLY the SQL.
        - To find grades, JOIN 'courses' ON courses.course_code = grades.c_code.
        - Use 'LIKE %...%' for names/departments.
        - If the user asks for their grade, SELECT course_name, letter_grade.
        """

        db_context = ""
        try:
            # We use Groq to quickly decide if we need SQL
            intent_check = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": intent_prompt}],
                model="llama-3.3-70b-versatile"
            ).choices[0].message.content.strip()

            if "SELECT" in intent_check.upper():
               
                clean_query = intent_check.replace("```sql", "").replace("```", "").strip()
                db_context = f"\n[DATABASE RESULTS]: {self.query_database(clean_query)}"
        except Exception as e:
            print(f"SQL Routing Error: {e}")

        # 2. Final Answer Generation (Hybrid Prompt)
        final_prompt = f"""
        You are a professional University Academic Advisor. 
        
        CONVERSATION LOG:
        {formatted_history}

        UNIVERSITY PDF/CSV DATA:
        {context}

        UNIVERSITY DATABASE DATA (Live Facts):
        {db_context}

        HISTORY: {history[-2:]}

        INSTRUCTIONS:
        1. If the DATABASE DATA contains results, use them as the ABSOLUTE TRUTH.
        2. If the PDF DATA has the answer, use it and mention the handbook.
        3. If neither has it, use your general academic knowledge to be helpful.
        4. Never say "I don't know" - provide the best guidance possible.
        
        Student Question: {question}
        AI ADVISOR RESPONSE:"""

        try:
            if self.provider == "gemini":
                response = self.gemini_model.generate_content(final_prompt)
                return response.text
            
            elif self.provider == "openai":
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": final_prompt}]
                )
                return response.choices[0].message.content
            
            elif self.provider == "groq":
                response = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": final_prompt}],
                    temperature=0.4 # Lower temperature for better accuracy
                )
                return response.choices[0].message.content

            elif self.provider == "local":
                response = self.local_client.chat.completions.create(
                    model="local-model", 
                    messages=[{"role": "user", "content": final_prompt}]
                )
                return response.choices[0].message.content
        except Exception as e:
            return f"⚠️ Error with {self.provider}: {str(e)}"