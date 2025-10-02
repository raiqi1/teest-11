from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "1234567898ygfvdcds"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

DUMMY_EMAIL = "test@test.com"
DUMMY_PASSWORD = "123456"

security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class Todo(BaseModel):
    id: int
    text: str
    completed: bool = False

# Data storage
todos = []

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token tidak valid")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token sudah expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

@app.post("/login")
def login(req: LoginRequest):
    if req.email == DUMMY_EMAIL and req.password == DUMMY_PASSWORD:
        access_token = create_access_token(data={"sub": req.email})
        return {
            "success": True,
            "message": "Login berhasil",
            "access_token": access_token,
            "token_type": "bearer"
        }
    raise HTTPException(status_code=401, detail="Email atau password salah")

@app.get("/todos")
def get_todos(email: str = Depends(verify_token)):
    return todos

@app.post("/todos")
def create_todo(todo: Todo, email: str = Depends(verify_token)):
    for t in todos:
        if t["id"] == todo.id:
            raise HTTPException(status_code=400, detail="ID sudah dipakai")
    todos.append(todo.dict())
    return {"message": "Todo berhasil ditambahkan", "todo": todo}

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, updated: Todo, email: str = Depends(verify_token)):
    for i, t in enumerate(todos):
        if t["id"] == todo_id:
            todos[i] = updated.dict()
            return {"message": "Todo berhasil diupdate", "todo": updated}
    raise HTTPException(status_code=404, detail="Todo tidak ditemukan")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, email: str = Depends(verify_token)):
    for i, t in enumerate(todos):
        if t["id"] == todo_id:
            deleted = todos.pop(i)
            return {"message": "Todo berhasil dihapus", "todo": deleted}
    raise HTTPException(status_code=404, detail="Todo tidak ditemukan")