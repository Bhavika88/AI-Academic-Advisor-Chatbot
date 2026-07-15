from fastapi import FastAPI
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm_service import LLMService
from typing import List, Dict
from vector_engine import search_knowledge, vector_index, docs
from fastapi.responses import FileResponse
from pdf_generator import generate_student_report
from jose import JWTError, jwt
import bcrypt
from datetime import datetime, timedelta
import sqlite3

SECRET_KEY = "751d3dbb08c6c264b15abdc666f643762fbf5503912128d6031d02e607179722"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


app = FastAPI(title="Academic Advisor API")

chat_memory = {}

# Choose your provider here: "local", "openai", or "gemini"
ai_advisor = LLMService(provider="groq")

sessions: Dict[str, List[Dict[str, str]]] = {}

# 1. Enable CORS (Cross-Origin Resource Sharing)
# This allows your HTML file (the 'frontend') to talk to this Python server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  you'd list your specific domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define the Request Shape
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_user"

@app.get("/download-report/{student_id}")
async def download_report(student_id: str):
    file_path = generate_student_report(student_id)
    return FileResponse(path=file_path, filename=f"Academic_Report_{student_id}.pdf")

@app.get("/")
def home():
    return {"message": "Academic Advisor Backend is running!"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        return user_id
    except JWTError:
        raise HTTPException(status_code=401)
    
@app.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: str = Depends(get_current_user)):
    user_id = f"user_{current_user}_{request.session_id}"

    is_new_session = user_id not in sessions
    
    # 1. Initialize history if new user
    if is_new_session:
        sessions[user_id] = []
    
    # 2. RETRIEVE: Search PDF/CSV
    raw_context = search_knowledge(request.message, vector_index, docs)
    
    # 3. GENERATE: Pass message, context, AND the history
    bot_response = ai_advisor.generate_response(
        request.message, 
        raw_context, 
        sessions[user_id]
    )
    
    # 4. SAVE: Update the history for the next turn
    sessions[user_id].append({"role": "student", "content": request.message})
    sessions[user_id].append({"role": "advisor", "content": bot_response})

    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    
    if is_new_session:
        # Create a dynamic title from the first message (truncated to 30 chars)
        display_title = (request.message[:30] + '...') if len(request.message) > 30 else request.message
        cursor.execute("INSERT OR IGNORE INTO chat_sessions (session_id, title) VALUES (?, ?)", 
                       (user_id, display_title))
    else:
        cursor.execute("UPDATE chat_sessions SET last_updated = CURRENT_TIMESTAMP WHERE session_id = ?", 
                       (user_id,))
    
    conn.commit()
    conn.close()
    
    # 5. Clean up old history
    if len(sessions[user_id]) > 10:
        sessions[user_id] = sessions[user_id][-10:]
        
    return {"response": bot_response}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, password_hash FROM users WHERE username = ?", (form_data.username,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    stored_hash = user[1].encode('utf-8')
    input_password = form_data.password.encode('utf-8')

    if not bcrypt.checkpw(input_password, stored_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = jwt.encode({"sub": str(user[0])}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/sessions")
async def get_all_sessions(current_user: str = Depends(get_current_user)):
    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    cursor.execute("SELECT session_id, title FROM chat_sessions ORDER BY last_updated DESC")
    rows = cursor.fetchall()
    conn.close()
    
    sessions_list = []
    for row in rows:
        full_session_id = row[0]
        title = row[1]
        
        # Extract clean ID for frontend (remove "user_X_" prefix)
        prefix = f"user_{current_user}_"
        if full_session_id.startswith(prefix):
            clean_id = full_session_id[len(prefix):]
        else:
            clean_id = full_session_id
        
        sessions_list.append({"id": clean_id, "title": title})
    
    print(f"📋 Returning {len(sessions_list)} sessions for user {current_user}")
    return sessions_list

@app.get("/chat-history/{session_id}")
async def get_chat_history(session_id: str, current_user: str = Depends(get_current_user)):
    # Construct the full user_id that matches how it's stored
    full_user_id = f"user_{current_user}_{session_id}"
    
    # Try memory first
    if full_user_id in sessions:
        return {"history": sessions[full_user_id]}
    
    return {"history": []}

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: str = Depends(get_current_user)):
    # Construct the full ID that matches how it's stored in DB and memory
    full_session_id = f"user_{current_user}_{session_id}"
    
    print(f"🗑️ Deleting session: {full_session_id} (clean: {session_id})")
    
    conn = sqlite3.connect('university.db')
    cursor = conn.cursor()
    
    # 1. Remove from SQLite using the full ID
    cursor.execute("DELETE FROM chat_sessions WHERE session_id = ?", (full_session_id,))
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    print(f"   Deleted {deleted_count} rows from database")
    
    # 2. Remove from active dictionary memory
    if full_session_id in sessions:
        del sessions[full_session_id]
        print(f"   Removed from memory sessions dict")
    
    # 3. Also remove from any other storage if needed
    # Clean up any messages if you have a messages table
    
    if deleted_count > 0:
        return {"message": "Session deleted successfully"}
    else:
        return {"message": "Session not found", "warning": True}
    
    # 1. Remove from SQLite
    cursor.execute("DELETE FROM chat_sessions WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()
    
    # 2. Remove from active dictionary memory
    if session_id in sessions:
        del sessions[session_id]
        
    return {"message": "Session deleted successfully"}