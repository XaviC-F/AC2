from typing import List
from pymongo import MongoClient
from bson import ObjectId

import threading
import time
from datetime import datetime

from ac2_backend.threshold import ResolutionStrategy, ThresholdModel

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["objectives_db"]
objectives_col = db["objectives"]


@app.post("/objective")
def create_objective(
    title: str,
    description: str,
    invited_names: List[str],
    resolution_date: datetime,
    published: bool = False,
):

    if isinstance(resolution_date, str):
        resolution_date = datetime.fromisoformat(resolution_date)

    objective_doc = {
        "title": title,
        "description": description,
        "resolution_date": resolution_date,
        # invited list lives inside the objective
        "invited_people": invited_names,  # list of strings
        # empty list at start
        "commitments": [],
        "published": published,
        "modified_at": datetime.utcnow().isoformat(),
    }

    result = objectives_col.insert_one(objective_doc)

    return str(result.inserted_id)


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


@app.patch("/commit")
def commit(objective_id, name, number):

    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        return "Objective not found."
    elif is_past_resolution_date(objective):
        return "The resolution date has been passed."

    invited_names = objective.get("invited_people", [])
    if name not in invited_names:
        return "Not invited. Ignored."

    else:
        objectives_col.update_one(
            {"_id": ObjectId(objective_id)},
            {
                "$push": {
                    "commitments": {
                        "name": name,
                        "number": number,
                        "committed_at": datetime.utcnow(),
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
                        "commited_people": current_equilibrium,
                        "modified_at": datetime.utcnow().isoformat(),
                    }
                },
            )

        return "Commitment stored."
    
@app.get("/objective/{objective_id}")    
def serve_view (objective_id):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if not objective.get("published"):
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": objective.get("resolution_date"),
        }
    else:
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": objective.get("resolution_date"),
            "commited_people": objective.get("commited_people"),
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
                "commited_people": o.get("commited_people"),
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