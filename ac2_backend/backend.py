import logging
import threading
import time
from datetime import datetime
from typing import Annotated, List, Optional

from bson import ObjectId
from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient

from ac2_backend.core.threshold import ResolutionStrategy, ThresholdModel

MAX_NAME_LENGTH = 1000
NameStr = Annotated[str, Field(min_length=1, max_length=MAX_NAME_LENGTH)]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")
db = client["objectives_db"]
objectives_col = db["objectives"]


class Objective(BaseModel):
    title: str
    description: str
    invited_names: List[NameStr]
    resolution_date: datetime
    resolution_strategy: Optional[ResolutionStrategy] = ResolutionStrategy.ASAP
    minimum_percentage: Optional[int]  # ignored


@app.post("/objective")
def create_objective(o: Objective):
    if isinstance(o.resolution_date, str):
        o.resolution_date = datetime.fromisoformat(o.resolution_date)

    objective_doc = {
        "title": o.title,
        "description": o.description,
        "resolution_date": o.resolution_date,
        # invited list lives inside the objective
        "invited_people": o.invited_names,  # list of strings
        "resolution_strategy": o.resolution_strategy,
        "commitments": [],
        "published": False,
        "modified_at": datetime.utcnow().isoformat(),
    }

    result = objectives_col.insert_one(objective_doc)

    return {"objective_id": str(result.inserted_id)}


def is_past_resolution_date(objective):
    res_date = objective.get("resolution_date")

    if res_date is None:
        return False

    # If stored as string "YYYY-MM-DD"
    if isinstance(res_date, str):
        res_date = datetime.fromisoformat(res_date)

    # Compare only the DATE part (not hour/min)
    today = datetime.utcnow().date()
    return today > res_date.date()


def compute_current_equilibrium(objective):
    commitments = objective.get("commitments", [])
    threshold_model = ThresholdModel(
        list(
            map(
                lambda c: (
                    c.get("name"),
                    c.get("number"),
                ),
                commitments,
            )
        ),
        ResolutionStrategy.OPTIMISTIC,
    )
    return threshold_model.resolve()


class Commitment(BaseModel):
    name: NameStr
    number: int = Field(..., ge=0)


@app.patch("/commit")
def commit(objective_id: str, c: Commitment):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        return {"message": "Objective not found."}
    elif is_past_resolution_date(objective):
        return {"message": "The resolution date has been passed."}

    invited_names = objective.get("invited_people", [])
    if c.name not in invited_names:
        return {"message": "Not invited. Ignored"}
    
    elif c.name in objective.get("commitments", []):
        return {"message": "Already committed"}
    
    else:
        objectives_col.update_one(
            {"_id": ObjectId(objective_id)},
            {
                "$push": {
                    "commitments": {
                        "name": c.name,
                        "number": c.number,
                        "committed_at": datetime.utcnow().isoformat(),
                    }
                }
            },
        )

        objective = objectives_col.find_one({"_id": ObjectId(objective_id)})

        current_equilibrium = compute_current_equilibrium(objective)
        if current_equilibrium:
            objectives_col.update_one(
                {"_id": ObjectId(objective["_id"])},
                {
                    "$set": {
                        "published": True,
                        "committed_people": current_equilibrium,
                        "modified_at": datetime.utcnow().isoformat(),
                    }
                },
            )

        return {"message": "Commitment stored."}


@app.get("/objective/{objective_id}")
def serve_view(objective_id):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if not objective.get("published"):
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": objective.get("resolution_date"),
            "published": objective.get("published"),
        }
    else:
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": objective.get("resolution_date"),
            "committed_people": objective.get("committed_people"),
            "published": objective.get("published"),
        }


@app.get("/recently_published")
def get_most_recently_published(limit: int = 10):
    objectives = (
        objectives_col.find({"published": True}).sort("modified_at", -1).limit(limit)
    )
    return list(
        map(
            lambda o: {
                "title": o.get("title"),
                "description": o.get("description"),
                "resolution_date": o.get("resolution_date"),
                "committed_people": o.get("committed_people"),
            },
            objectives,
        )
    )


@app.get("/debug/objective/{objective_id}")
def debug_objective(objective_id: str):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        raise HTTPException(status_code=404, detail="Objective not found")

    # Convert ObjectId + datetime to JSON-friendly types
    objective["_id"] = str(objective["_id"])
    return jsonable_encoder(objective)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )
