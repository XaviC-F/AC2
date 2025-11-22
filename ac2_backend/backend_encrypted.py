import logging
from typing import List, Tuple, Dict, Optional, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ac2_backend.commit_classes import NameHolder, CommitEncrypter, CommitDecrypter

# Logging setup
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
# Service Interface Definitions / Wrappers
# -----------------------------------------------------------------------------

class NameHolderService:
    """
    Service wrapper for NameHolder.
    In a distributed setup, this could be a client to the NameHolder server.
    """
    def __init__(self, names: List[str]):
        self._backend = NameHolder(names)

    def is_member(self, name: str) -> bool:
        # Could be an RPC call: requests.get(f"http://nameholder/check?name={name}")
        return self._backend.is_member(name)

class CommitEncrypterService:
    """
    Service wrapper for CommitEncrypter.
    In a distributed setup, this could be a client to the Encryption server.
    """
    def __init__(self, name_holder_service: NameHolderService, group_size: int, min_count: int):
        # We inject the NameHolderService. 
        # CommitEncrypter expects an object with .is_member(name), which our service provides.
        self._backend = CommitEncrypter(name_holder_service, group_size, min_count)

    def commit(self, name: str, threshold: int) -> Tuple[str, List[Tuple[int, int]]]:
        # Could be an RPC call
        return self._backend.commit(name, threshold)

class CommitDecrypterService:
    """
    Service wrapper for CommitDecrypter.
    Represents the 'Observer' or 'Public Log' processor.
    """
    def __init__(self, group_size: int):
        self._backend = CommitDecrypter(group_size)

    def add_commitment(self, ciphertext: str, points: List[Tuple[int, int]]):
        self._backend.add_commitment(ciphertext, points)

    def decrypt(self) -> List[str]:
        return self._backend.decrypt()

# -----------------------------------------------------------------------------
# Global State
# -----------------------------------------------------------------------------

class SystemState:
    def __init__(self):
        self.name_holder: Optional[NameHolderService] = None
        self.encrypter: Optional[CommitEncrypterService] = None
        self.decrypter: Optional[CommitDecrypterService] = None
        self.group_size: int = 0
        self.is_initialized: bool = False

state = SystemState()

# -----------------------------------------------------------------------------
# API Models
# -----------------------------------------------------------------------------

class SetupRequest(BaseModel):
    names: List[str]
    min_count: int = 1

class CommitRequest(BaseModel):
    name: str
    threshold: int # 1 to N, or -1 for never

class CommitmentResponse(BaseModel):
    ciphertext: str
    points: List[Tuple[int, int]] # List of (x, y)

class DecryptResponse(BaseModel):
    revealed_names: List[str]

# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "AC2 Encrypted Backend Running"}

@app.post("/setup")
def setup_system(req: SetupRequest):
    """
    Initialize the services with a set of allowed names (N).
    This simulates the server startup/configuration phase.
    """
    n = len(req.names)
    if n == 0:
        raise HTTPException(status_code=400, detail="Must provide at least one name")
    
    # 1. Initialize NameHolder Service (Privileged Info: List of Names)
    state.name_holder = NameHolderService(req.names)
    
    # 2. Initialize Encrypter Service (Privileged Info: Coefficients)
    # It relies on NameHolder to verify membership without needing the full list itself 
    # (though in this local instantiation it holds the object, logically it only queries is_member)
    state.encrypter = CommitEncrypterService(state.name_holder, n, req.min_count)
    
    # 3. Initialize Decrypter Service (Public Observer)
    state.decrypter = CommitDecrypterService(n)
    
    state.group_size = n
    state.is_initialized = True
    
    logger.info(f"System initialized with {n} names and min_count {req.min_count}")
    
    return {
        "status": "initialized", 
        "group_size": n,
        "min_count": req.min_count
    }

@app.post("/commit", response_model=CommitmentResponse)
def post_commit(req: CommitRequest):
    """
    User commits to the server.
    Server verifies membership and returns encrypted commitment data.
    This data is then 'published' to the Decrypter (Observer).
    """
    if not state.is_initialized:
        raise HTTPException(status_code=400, detail="System not initialized. Call /setup first.")
    
    # Delegate to Encrypter Service
    # In a real protocol, the user sends a proof. 
    # Here, the EncrypterService checks the name against NameHolder.
    ciphertext, points = state.encrypter.commit(req.name, req.threshold)
    
    # "The server then publishes..."
    # We simulate publication by sending it to the Decrypter service immediately.
    state.decrypter.add_commitment(ciphertext, points)
    
    return {
        "ciphertext": ciphertext,
        "points": points
    }

@app.get("/decrypt", response_model=DecryptResponse)
def get_decrypted_view():
    """
    Returns the names that are currently revealed to the outside observer.
    """
    if not state.is_initialized:
        raise HTTPException(status_code=400, detail="System not initialized.")
        
    revealed = state.decrypter.decrypt()
    return {"revealed_names": revealed}

@app.get("/status")
def get_status():
    return {
        "initialized": state.is_initialized,
        "group_size": state.group_size,
        "commitments_count": len(state.decrypter._backend.commitments) if state.decrypter else 0
    }
