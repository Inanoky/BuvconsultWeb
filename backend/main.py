from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workers
from database.models import Base
from database.session import engine



# Import routers

from routers.program_parser import router as program_router
from routers import attendance
from routers import locations
from routers import works
from routers import invoices
from routers import categorize
from routers import analytics
from routers import site_diary
from routers import AiAssistant


app = FastAPI()
Base.metadata.create_all(bind=engine)

# CORS setup to allow frontend-app to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set to your frontend-app origin for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes

app.include_router(program_router, prefix="/api")  # ✅ key line!
app.include_router(workers.router, prefix="/api/workers", tags=["Workers"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(locations.router, prefix="/api/locations", tags=["Locations"])
app.include_router(works.router, prefix="/api/works", tags=["Works"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(categorize.router, prefix="/api/invoices", tags=["Categorize"])
app.include_router(analytics.router)
app.include_router(site_diary.router)
app.include_router(AiAssistant.router, prefix="/api/AiAssistant", tags=["Categorize"])
