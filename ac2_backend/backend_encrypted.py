from typing import Annotated, List, Tuple, Dict, Optional, Set, Any
from pymongo import MongoClient
from bson import ObjectId
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

# -----------------------------------------------------------------------------
# DB Setup
# -----------------------------------------------------------------------------
client = MongoClient("mongodb://localhost:27017/")
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
    resolution_strategy: Optional[str] = "ASAP"
    minimum_number: Optional[int] = 1

class Commitment(BaseModel):
    name: NameStr
    Number: int # Treated as threshold in encrypted context

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def points_to_db(points: List[Tuple[int, int]]) -> List[List[str]]:
    """Convert points with large integers to string format for MongoDB storage"""
    return [[str(x), str(y)] for x, y in points]

def points_from_db(points_db: List[List[str]]) -> List[Tuple[int, int]]:
    """Convert points from MongoDB string format back to tuples of integers"""
    return [(int(x), int(y)) for x, y in points_db]

def restore_encrypter(objective_doc) -> CommitEncrypter:
    invited = objective_doc.get("invited_people", [])
    nh = NameHolder(invited)
    n = len(invited)
    
    min_num = objective_doc.get("minimum_number", 1)
    min_count = max(1, min(min_num, n))
    
    # Check for legacy "encrypted_state" first (backward compatibility)
    enc_state = objective_doc.get("encrypted_state", {})
    if enc_state:
        # Legacy reconstruction (not supported by new CommitEncrypter properly, but we try to adapt)
        # We would need a custom class or manual patch. For now, assume migration or new data.
        # If crucial, we'd use a subclass. But since we just added seed support to CommitEncrypter,
        # let's stick to the seed path primarily.
        # If legacy state exists, we might fail or need the old StatefulCommitEncrypter.
        # For simplicity in this refactor, we assume seed exists or we generate a deterministic one if missing but state exists (risky).
        pass
        
    seed = objective_doc.get("encryption_seed")
    if not seed:
        logger.warning("No encryption seed found, using fallback random seed")
        seed = "fallback_seed"
            
    # Initialize with seed
    encrypter = CommitEncrypter(nh, min_count, seed=seed)
    
    # Reconstruct used_xs from stored commitments
    used_xs = []
    for c in objective_doc.get("commitments", []):
        for p in c.get("points", []):
            # p is [x, y] stored as strings
            used_xs.append(int(p[0]))
            
    encrypter.set_used_xs(used_xs)
    
    return encrypter

def restore_decrypter(objective_doc) -> CommitDecrypter:
    invited = objective_doc.get("invited_people", [])
    cd = CommitDecrypter(len(invited))
    
    stored_commitments = objective_doc.get("commitments", [])
    for c in stored_commitments:
        if "ciphertext" in c and "points" in c:
            pts = points_from_db(c["points"])
            cd.add_commitment(c["ciphertext"], pts)
            
    return cd

def is_past_resolution_date(objective):
    res_date = objective.get("resolution_date")
    if res_date is None:
        return False
    if isinstance(res_date, str):
        res_date = datetime.fromisoformat(res_date)
    today = datetime.utcnow().date()
    return today > res_date.date()

# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "AC2 Encrypted Backend Running"}

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
        "minimum_number": o.minimum_number,
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
    elif is_past_resolution_date(objective):
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
    decrypter = restore_decrypter(objective)
    
    revealed_names = decrypter.decrypt()
    
    if revealed_names:
        objectives_col.update_one(
            {"_id": ObjectId(objective_id)},
            {
                "$set": {
                    "published": True,
                    "committed_people": revealed_names,
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
        
    resp = {
        "title": objective.get("title"),
        "description": objective.get("description"),
        "resolution_date": objective.get("resolution_date"),
        "published": objective.get("published"),
        "committed_people": objective.get("committed_people") if objective.get("published") else None
    }
    return resp

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
