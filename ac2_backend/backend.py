from pymongo import MongoClient
from bson import ObjectId

import threading
import time
from datetime import datetime

from fastapi import FastAPI

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["objectives_db"]
objectives_col = db["objectives"]

@app.post("/objective")
def create_objective(title, description, invited_names, resolution_date, published = False):

    if isinstance(resolution_date, str):
        resolution_date = datetime.fromisoformat(resolution_date)

    objective_doc = {
        "title": title,
        "description": description,
        "resolution_date": resolution_date,

        # invited list lives inside the objective
        "invited_people": invited_names,   # list of strings
        # empty list at start
        "commitments": [],
        "published": False
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

def check_equilibrium(objective):
    return

app.patch("/commit")
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
            {"$push": {
                "commitments": {
                    "name": name,
                    "number": number,
                    "committed_at": datetime.utcnow()
                }
            }}
        )

        objective = objectives_col.find_one({"_id": ObjectId(objective_id)})

        if check_equilibrium(objective) == True:
            objectives_col.update_one(
                {"_id": ObjectId(objective["_id"])},
                {"$set": {"published": True}}
            )

        return "Commitment stored."
    
app.get("/objective/{objective_id}")    
def serve_view (objective_id):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective.get("published") == False:
        return {"title": objective.get("title"),
                "description": objective.get("description"),
                "resolution_date": objective.get("resolution_date")
                }
    else:
        return {"title": objective.get("title"),
                "description": objective.get("description"),
                "resolution_date": objective.get("resolution_date"),
                "commitments": objective.get("commitments")
                }

