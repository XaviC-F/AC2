from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["objectives_db"]
objectives_col = db["objectives"]

def create_objective(title, description, invited_names, resolution_date, published = False):
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

def commit(objective_id, name, number):

    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        return "Objective not found."

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
        return "Commitment stored."
    
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
    