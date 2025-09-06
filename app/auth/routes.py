from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from datetime import timedelta
from app.auth.auth import verify_password, get_password_hash, create_access_token, verify_token
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Simple in-memory user store for demonstration
# In production, this would be a database
users_db = {}

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_password = get_password_hash(user.password)
    users_db[user.email] = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "is_active": True
    }
    
    return {"message": "User registered successfully", "email": user.email}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    user_data = users_db.get(user.email)
    if not user_data or not verify_password(user.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user(current_user: str = Depends(verify_token)):
    user_data = users_db.get(current_user)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"email": current_user, "full_name": user_data["full_name"]}