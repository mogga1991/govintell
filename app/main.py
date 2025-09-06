from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.opportunities import router as opportunities_router
from app.api.opportunities_v2 import router as opportunities_v2_router
from app.auth.routes import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown

app = FastAPI(
    title="RFQ Intelligence API",
    description="Procurement automation tool for government contractors",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(opportunities_router, prefix="/api/v1")  # Legacy API
app.include_router(opportunities_v2_router, prefix="/api/v2")  # Enhanced API

@app.get("/")
async def root():
    return {"message": "RFQ Intelligence API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)