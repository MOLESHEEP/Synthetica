from fastapi import FastAPI
from redis import Redis
from redis.exceptions import ConnectionError
import sys

app = FastAPI()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "python_version": sys.version,
    }

@app.get("/api/health/redis")
def redis_check():
    try:
        r = Redis.from_url("redis://localhost:6379/0")
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except ConnectionError:
        return {"status": "error", "redis": "unreachable"}