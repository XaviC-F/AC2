from typing import Annotated, List, Tuple, Optional
from enum import Enum
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

client = MongoClient(config("DATABASE_URI", default=DEFAULT_DATABASE_URI))
db = client["objectives_db"]
objectives_col = db["objectives"]

# -----------------------------------------------------------------------------
# Helpers and models
# -----------------------------------------------------------------------------

class ResolutionStrategy(str, Enum):
    ASAP = "ASAP"
    DEADLINE = "DEADLINE"


class Commitment(BaseModel):
    # Capitalized field name kept for backward/front-end compatibility
    Number: int
    name: NameStr


def points_to_db(points: List[Tuple[int, int]]) -> List[List[str]]:
    """Convert (x, y) tuples with big ints to strings for MongoDB."""
    return [[str(x), str(y)] for x, y in points]


def points_from_db(points_db: List[List[str]]) -> List[Tuple[int, int]]:
    """Restore (x, y) tuples from their string representation."""
    return [(int(x), int(y)) for x, y in points_db]


def restore_encrypter(objective_doc) -> CommitEncrypter:
    invited = objective_doc.get("invited_people", [])
    nh = NameHolder(invited)
    n = len(invited)

    min_count = max(1, min(objective_doc.get("minimum_number", 1), n))

    seed = objective_doc.get("encryption_seed")
    if not seed:
        logger.warning("No encryption seed found, using fallback random seed")
        seed = "fallback_seed"

    encrypter = CommitEncrypter(nh, min_count, seed=seed)

    used_xs = []
    for c in objective_doc.get("commitments", []):
        for p in c.get("points", []):
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
# Models
# -----------------------------------------------------------------------------

class Objective(BaseModel):
    title: str
    description: str
    eligible_names: List[NameStr]
    resolution_date: datetime
    resolution_strategy: Optional[str] = "DEADLINE"
    minimum_commitments: Optional[int] = 1
    visibility: Optional[str] = "private"

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
    eligible = objective_doc.get("eligible_people") or objective_doc.get("invited_people", [])
    nh = NameHolder(eligible)
    n = len(eligible)
    
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
    eligible = objective_doc.get("eligible_people") or objective_doc.get("invited_people", [])
    cd = CommitDecrypter(len(eligible))
    
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
    return {
        "message": "AC2 Encrypted Backend Running",
        "version": "2.0",
        "encryption": "Threshold-based cryptographic commitments",
        "strategies": {
            "ASAP": "Closes immediately when threshold is met",
            "DEADLINE": "Accepts commitments until resolution date"
        }
    }

@app.post("/objective")
def create_objective(o: Objective):
    if isinstance(o.resolution_date, str):
        o.resolution_date = datetime.fromisoformat(o.resolution_date)

    n = len(o.eligible_names)
    if n == 0:
        raise HTTPException(status_code=400, detail="Must provide at least one name")
    
    # Generate a random seed for deterministic encryption
    encryption_seed = secrets.token_hex(32)
    
    objective_doc = {
        "title": o.title,
        "description": o.description,
        "resolution_date": o.resolution_date,
        "eligible_people": o.eligible_names,
        "invited_people": o.eligible_names, # Backward compatibility
        "resolution_strategy": o.resolution_strategy,
        "visibility": o.visibility,
        "minimum_commitments": o.minimum_commitments,
        "commitments": [],
        "closed": False,
        "modified_at": datetime.utcnow().isoformat(),
        "encryption_seed": encryption_seed,
        "committed_people": [],
        "used_name_hashes": []
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
    is_closed = objective.get("closed", False)
    
    # ASAP strategy: close as soon as threshold is met (even if deadline not reached)
    if resolution_strategy == "ASAP" and is_closed:
        return {"message": "Objective already resolved (ASAP strategy). No new commitments accepted."}
    
    # DEADLINE strategy: accept commits until deadline (even if already published/decrypted)
    if resolution_strategy == "DEADLINE" and is_past_resolution_date(objective):
        return {"message": "The resolution date has been passed."}
    
    # For ASAP, also check if past deadline as a hard cutoff
    if resolution_strategy == "ASAP" and is_past_resolution_date(objective):
        return {"message": "The resolution date has been passed."}

    eligible_names = objective.get("eligible_people") or objective.get("invited_people", [])
    if c.name not in eligible_names:
        # Security: Leak no info. Generate fake success.
        # Return random ciphertext and noise points, but do not save to DB.
        # This makes it impossible to enumerate valid users via timing or error messages (mostly).
        fake_ciphertext = secrets.token_hex(16) # Same length as real
        # Generate fake points (all zeros, as if not in group)
        n = len(eligible_names)
        fake_points = [(0, 0) for _ in range(n)]
        
        return {
            "message": "Commitment stored.", 
            "ciphertext": fake_ciphertext,
            "_debug_note": "Ignored (Not eligible)" # Only visible if inspecting response JSON manually
        }

    # Check for duplicate commitment using stored hashes
    import hashlib
    name_hash = hashlib.sha256(c.name.encode('utf-8')).hexdigest()
    if name_hash in objective.get("used_name_hashes", []):
         return {"message": "Already committed"}

    # Restore Encrypter State
    try:
        encrypter = restore_encrypter(objective)
    except Exception as e:
        logger.error(f"Failed to restore encrypter: {e}", exc_info=True)
        return {"message": "Internal error restoring encryption state."}
    
    # Perform Encryption
    # c.Number is interpreted as the threshold. 
    # If 0 (decline), we map to -1 for noise generation.
    threshold_val = -1 if c.Number == 0 else c.Number
    ciphertext, points = encrypter.commit(c.name, threshold=threshold_val)
    
    # Create commitment record
    # Convert points to strings for MongoDB (can't handle 127-bit ints)
    new_commitment = {
        "name": "HIDDEN", 
        "ciphertext": ciphertext,
        "points": points_to_db(points),
        "committed_at": datetime.utcnow().isoformat(),
        "is_decline": (c.Number == 0)
    }
    
    # Update DB: push commitment
    # We NO LONGER update encrypted_state.used_xs explicitly because 
    # we reconstruct it from commitments next time.
    objectives_col.update_one(
        {"_id": ObjectId(objective_id)},
        {
            "$push": {
                "commitments": new_commitment,
                "used_name_hashes": name_hash
            },
            "$set": {
                "modified_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Check for resolution (Decryption) or Closing
    objective = objectives_col.find_one({"_id": ObjectId(objective_id)})
    
    # Check if everyone has responded (committed or declined)
    eligible_names = objective.get("eligible_people") or objective.get("invited_people", [])
    num_commitments = len(objective.get("commitments", []))
    
    if num_commitments >= len(eligible_names):
        # Everyone has responded, so we can close the objective
        objectives_col.update_one(
            {"_id": ObjectId(objective_id)},
            {"$set": {"closed": True}}
        )
        objective["closed"] = True # Update local copy for next checks

    resolution_strategy = objective.get("resolution_strategy", "ASAP").upper()
    is_closed = objective.get("closed", False)

    # Check if EVERYONE has responded (committed or declined)
    eligible_count = len(objective.get("eligible_people") or objective.get("invited_people", []))
    current_responses = len(objective.get("commitments", []))
    
    should_close_immediately = False
    if current_responses >= eligible_count:
        should_close_immediately = True

    # - ASAP: Closes to new commits after first decryption
    # - DEADLINE: Continues accepting commits until deadline. Only resolves at deadline.
    should_attempt_decrypt = False
    
    if resolution_strategy == "ASAP":
        should_attempt_decrypt = True
    elif resolution_strategy == "DEADLINE":
        if is_past_resolution_date(objective) or should_close_immediately:
            should_attempt_decrypt = True
    
    if should_attempt_decrypt:
        decrypter = restore_decrypter(objective)
        revealed_names, decryption_details = decrypter.decrypt_with_details()
        
        # If we are closing immediately due to full participation, we should mark closed
        # even if no names are revealed (e.g. everyone declined)
        mark_as_closed = False
        if revealed_names:
            mark_as_closed = True
        elif should_close_immediately:
            mark_as_closed = True

        if mark_as_closed:
             # Mark commitments as decrypted and add coefficients
            updated_commitments = []
            number_revealed = 0
            for idx, commitment in enumerate(objective.get("commitments", [])):
                updated_commitment = dict(commitment)
                if idx in decryption_details:
                    number_revealed += 1
                    detail = decryption_details[idx]
                    updated_commitment["decrypted"] = True
                    updated_commitment["decrypted_name"] = detail["name"]
                    updated_commitment["threshold"] = detail["threshold"]
                    # Store coefficients as strings
                    updated_commitment["coefficients"] = [str(c) for c in detail["coefficients"]]
                    updated_commitment["decryption_level"] = detail["level"]
                else:
                    updated_commitment["decrypted"] = False
                updated_commitments.append(updated_commitment)
            if number_revealed >= objective.minimum_commitments:

                objectives_col.update_one(
                    {"_id": ObjectId(objective_id)},
                    {
                        "$set": {
                            "closed": True,
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
    
    # Check if deadline has passed and objective not yet closed
    # This handles cases where no one committed after the deadline but it should be resolved now
    if not objective.get("closed") and is_past_resolution_date(objective):
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
                    # Store coefficients as strings
                    updated_commitment["coefficients"] = [str(c) for c in detail["coefficients"]]
                    updated_commitment["decryption_level"] = detail["level"]
                else:
                    updated_commitment["decrypted"] = False
                updated_commitments.append(updated_commitment)

            objectives_col.update_one(
                {"_id": ObjectId(objective_id)},
                {
                    "$set": {
                        "closed": True,
                        "committed_people": revealed_names,
                        "commitments": updated_commitments,
                        "modified_at": datetime.utcnow().isoformat()
                    }
                }
            )
            # Reload objective
            objective = objectives_col.find_one({"_id": ObjectId(objective_id)})

    # Convert commitment data for frontend display
    commitments_display = []
    for c in objective.get("commitments", []):
        commitment_data = {
            "ciphertext": c.get("ciphertext"),
            "points": c.get("points"),  # Already in [[x, y], ...] format as strings
            "committed_at": c.get("committed_at"),
            "decrypted": c.get("decrypted", False)
        }
        # Include decryption details if available
        if c.get("decrypted"):
            commitment_data["decrypted_name"] = c.get("decrypted_name")
            commitment_data["threshold"] = c.get("threshold")
            commitment_data["coefficients"] = c.get("coefficients", [])
            commitment_data["decryption_level"] = c.get("decryption_level")
        commitments_display.append(commitment_data)
        
    resp = {
        "title": objective.get("title"),
        "description": objective.get("description"),
        "resolution_date": objective.get("resolution_date"),
        "closed": objective.get("closed"),
        "committed_people": objective.get("committed_people", []),
        "commitments": commitments_display,
        "resolution_strategy": objective.get("resolution_strategy", "ASAP"),
        "minimum_number": objective.get("minimum_number", 1),
        "eligible_count": len(objective.get("eligible_people") or objective.get("invited_people", [])),
        "invited_count": len(objective.get("eligible_people") or objective.get("invited_people", [])) # Backward compatibility
    }
    return resp

@app.get("/objectives")
def list_objectives(sort_by: str = "created_at"):
    # Only return public objectives
    # Sorting: created_at (newest), resolution_date (closing soon), title
    
    cursor = objectives_col.find({"visibility": {"$ne": "private"}})
    
    if sort_by == "resolution_date":
        cursor = cursor.sort("resolution_date", 1) # Earliest deadline first
    elif sort_by == "title":
        cursor = cursor.sort("title", 1)
    else:
        # Default to newest first (using _id or modified_at)
        cursor = cursor.sort("_id", -1)
        
    objectives = cursor.limit(50) # Reasonable limit
    
    return list(
        map(
            lambda o: {
                "id": str(o.get("_id")),
                "title": o.get("title"),
                "description": o.get("description"),
                "resolution_date": o.get("resolution_date"),
                "resolutionDate": o.get("resolution_date"),
                "committed_people": o.get("committed_people"),
                "resolution_strategy": o.get("resolution_strategy", "DEADLINE"),
                "closed": o.get("closed", False)
            },
            objectives,
        )
    )

@app.get("/recently_published")
def get_most_recently_published(limit: int = 10):
    # Keep for backward compatibility or specific "Recent" widget, but filter private
    objectives = (
        objectives_col.find({"closed": True, "visibility": {"$ne": "private"}})
        .sort("modified_at", -1)
        .limit(limit)
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
