from typing import Annotated, List, Tuple, Optional
from pymongo import MongoClient
from bson import ObjectId
from decouple import config
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import secrets

# Import encrypted logic classes
from ac2_backend.core.commit_classes import NameHolder, CommitEncrypter, CommitDecrypter

MAX_NAME_LENGTH = 1000
NameStr = Annotated[str, Field(min_length=1, max_length=MAX_NAME_LENGTH)]
DEFAULT_DATABASE_URI = "mongodb://localhost:27017/"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Encrypted Backend")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

client = MongoClient(config("DATABASE_URI"))
db = client["objectives_db"]
objectives_col = db["objectives"]

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------

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

    n = len(o.invited_names)
    if n == 0:
        raise HTTPException(status_code=400, detail="Must provide at least one name")
    
    # Generate a random seed for deterministic encryption
    encryption_seed = secrets.token_hex(32)
    
    objective_doc = {
        "title": o.title,
        "description": o.description,
        "resolution_date": o.resolution_date,
        "invited_people": o.invited_names,
        "resolution_strategy": o.resolution_strategy,
        "commitments": [],
        "published": False,
        "modified_at": datetime.utcnow().isoformat(),
        "encryption_seed": encryption_seed,
        "committed_people": []
    }

    result = objectives_col.insert_one(objective_doc)
    return {"objective_id": str(result.inserted_id)}

@app.patch("/commit/{objective_id}")
def commit(objective_id: str, c: Commitment):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        return {"message": "Objective not found."}
    
    # Check resolution strategy
    resolution_strategy = objective.get("resolution_strategy", "ASAP").upper()
    is_published = objective.get("published", False)
    
    # ASAP strategy: close as soon as threshold is met (even if deadline not reached)
    if resolution_strategy == "ASAP" and is_published:
        return {"message": "Objective already resolved (ASAP strategy). No new commitments accepted."}
    
    # DEADLINE strategy: accept commits until deadline (even if already published/decrypted)
    if resolution_strategy == "DEADLINE" and is_past_resolution_date(objective):
        return {"message": "The resolution date has been passed."}
    
    # For ASAP, also check if past deadline as a hard cutoff
    if resolution_strategy == "ASAP" and is_past_resolution_date(objective):
        return {"message": "The resolution date has been passed."}

    invited_names = objective.get("invited_people", [])
    if c.name not in invited_names:
        return {"message": "Not invited. Ignored"}

    # Restore Encrypter State
    try:
        encrypter = restore_encrypter(objective)
    except Exception as e:
        logger.error(f"Failed to restore encrypter: {e}", exc_info=True)
        return {"message": "Internal error restoring encryption state."}
    
    # Perform Encryption
    # c.Number is interpreted as the threshold
    ciphertext, points = encrypter.commit(c.name, threshold=c.Number)
    
    # Create commitment record
    # Convert points to strings for MongoDB (can't handle 127-bit ints)
    new_commitment = {
        "name": "HIDDEN", 
        "ciphertext": ciphertext,
        "points": points_to_db(points),
        "committed_at": datetime.utcnow().isoformat(),
    }
    
    # Update DB: push commitment
    # We NO LONGER update encrypted_state.used_xs explicitly because 
    # we reconstruct it from commitments next time.
    objectives_col.update_one(
        {"_id": ObjectId(objective_id)},
        {
            "$push": {"commitments": new_commitment},
            "$set": {
                "modified_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Check for resolution (Decryption)
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    resolution_strategy = objective.get("resolution_strategy", "ASAP").upper()
    
    # Both ASAP and DEADLINE attempt decryption immediately when thresholds are met
    # The difference is:
    # - ASAP: Closes to new commits after first decryption
    # - DEADLINE: Continues accepting commits until deadline even after decryption
    should_attempt_decrypt = True
    
    if should_attempt_decrypt:
        decrypter = restore_decrypter(objective)
        revealed_names, decryption_details = decrypter.decrypt_with_details()
        
        if revealed_names:
            # Mark commitments as decrypted and add coefficients
            updated_commitments = []
            for idx, commitment in enumerate(objective.get("commitments", [])):
                updated_commitment = dict(commitment)
                if idx in decryption_details:
                    detail = decryption_details[idx]
                    updated_commitment["decrypted"] = True
                    updated_commitment["decrypted_name"] = detail["name"]
                    updated_commitment["threshold"] = detail["threshold"]
                    # Store coefficients as strings (MongoDB can't handle 127-bit ints)
                    updated_commitment["coefficients"] = [str(c) for c in detail["coefficients"]]
                    updated_commitment["decryption_level"] = detail["level"]
                else:
                    updated_commitment["decrypted"] = False
                updated_commitments.append(updated_commitment)
            
            objectives_col.update_one(
                {"_id": ObjectId(objective_id)},
                {
                    "$set": {
                        "published": True,
                        "committed_people": revealed_names,
                        "commitments": updated_commitments,
                        "modified_at": datetime.utcnow().isoformat()
                    }
                }
            )
        
    return {"message": "Commitment stored.", "ciphertext": ciphertext}

@app.get("/objective/{objective_id}")
def serve_view(objective_id: str):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")

    # Normalize field names for the frontend while keeping originals for compatibility
    resolution_date = objective.get("resolution_date")
    committers = objective.get("committers") or objective.get("committed_people")

    if not objective.get("published"):
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": resolution_date,
            "resolutionDate": resolution_date,
            "published": objective.get("published"),
        }
    else:
        return {
            "title": objective.get("title"),
            "description": objective.get("description"),
            "resolution_date": resolution_date,
            "resolutionDate": resolution_date,
            "committed_people": committers,
            "committers": committers,
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
                "resolutionDate": o.get("resolution_date"),
                "committed_people": o.get("committed_people"),
                "committers": o.get("committers") or o.get("committed_people"),
            },
            objectives,
        )
    )

@app.get("/debug/objective/{objective_id}")
def debug_objective(objective_id: str):
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    if objective is None:
        raise HTTPException(status_code=404, detail="Objective not found")
    objective["_id"] = str(objective["_id"])
    return jsonable_encoder(objective)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    logging.error(f"{request}: {exc_str}")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )
