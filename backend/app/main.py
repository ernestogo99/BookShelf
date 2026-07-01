from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users
from app.routers import auth, books, discover, lists, readings, reviews, stats

app = FastAPI(title="BookShelf API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(books.router, prefix="/books", tags=["books"])
app.include_router(readings.router, prefix="/readings", tags=["readings"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(lists.router, prefix="/lists", tags=["lists"])
app.include_router(discover.router, prefix="/discover", tags=["discover"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok"}
