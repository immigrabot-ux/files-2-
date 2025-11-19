from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

app = FastAPI(
    title="LectureAI API",
    description="Video processing backend for LectureAI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "lectureai-backend",
        "version": "1.0.0"
    }


@app.on_event("startup")
async def startup_event():
    logger.info("LectureAI Backend starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("LectureAI Backend shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
