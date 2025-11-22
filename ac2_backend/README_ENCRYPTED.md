# AC2 Encrypted Backend

This is the encrypted version of the AC2 backend that uses polynomial secret sharing and threshold cryptography to ensure privacy-preserving commitment revelation.

## Features

- **Encrypted Commitments**: User names are encrypted using polynomial-based secret sharing
- **Threshold-Based Revelation**: Names are only revealed when enough people commit at compatible thresholds
- **Privacy-Preserving**: Server cannot decrypt individual commitments until threshold conditions are met
- **Deterministic Encryption**: Uses a random seed per objective for reproducible encryption (testing/debugging)

## Running the Server

From the project root directory:

```bash
./run-encrypted-server.sh
```

This will start:
- **Encrypted Backend** on `http://localhost:8001`
- **Frontend** on `http://localhost:3000` (automatically configured to use encrypted backend)

To stop all servers, press **Ctrl+C** in the terminal.

The frontend is automatically configured to connect to port 8001 via the `NEXT_PUBLIC_API_URL` environment variable.

## API Endpoints

### Create an Objective
```
POST /objective
```
**Body:**
```json
{
  "title": "Group Dinner",
  "description": "Let's organize a dinner",
  "invited_names": ["Alice", "Bob", "Charlie"],
  "resolution_date": "2025-12-31T23:59:59",
  "resolution_strategy": "ASAP",
  "minimum_number": 2
}
```

**Response:**
```json
{
  "objective_id": "507f1f77bcf86cd799439011"
}
```

### Submit a Commitment
```
PATCH /commit/{objective_id}
```
**Body:**
```json
{
  "name": "Alice",
  "Number": 2
}
```
- `name`: The person's name (must be in invited list)
- `Number`: Threshold - minimum number of people needed for this person to be revealed

**Response:**
```json
{
  "message": "Commitment stored.",
  "ciphertext": "a1b2c3..."
}
```

### View Objective Status
```
GET /objective/{objective_id}
```

**Response (before publication):**
```json
{
  "title": "Group Dinner",
  "description": "Let's organize a dinner",
  "resolution_date": "2025-12-31T23:59:59",
  "published": false,
  "committed_people": null
}
```

**Response (after publication):**
```json
{
  "title": "Group Dinner",
  "description": "Let's organize a dinner",
  "resolution_date": "2025-12-31T23:59:59",
  "published": true,
  "committed_people": ["Alice", "Bob"]
}
```

### Recently Published Objectives
```
GET /recently_published?limit=10
```

### Debug Endpoint (Development)
```
GET /debug/objective/{objective_id}
```
Returns full objective document including encrypted state.

## Interactive API Documentation

Visit `http://localhost:8001/docs` when the server is running for interactive API documentation powered by Swagger UI.

## How the Encryption Works

1. **Setup**: When an objective is created, a random encryption seed is generated
2. **Commitment**: When a user commits:
   - Their name is encrypted using polynomial coefficients
   - Shares of the polynomial are generated based on their threshold
   - Only the ciphertext and polynomial points are stored
3. **Revelation**: The server attempts decryption at each level:
   - Collects valid points from all commitments
   - Tries to recover polynomial coefficients
   - Attempts to decrypt ciphertexts with recovered keys
   - Only succeeds when enough compatible commitments exist

## Requirements

- Python 3.13+
- MongoDB running on localhost:27017
- Virtual environment with dependencies installed (run `./setup.sh` from project root)

## Differences from Regular Backend

| Feature | Regular Backend | Encrypted Backend |
|---------|----------------|-------------------|
| Port | 8000 | 8001 |
| Commitments | Plaintext storage | Encrypted storage |
| Name Visibility | Immediate | Threshold-based |
| Database Fields | Simple | Includes encryption_seed, ciphertext, points |
| Privacy | Low | High |

## Testing

The encrypted backend has been thoroughly tested with:
- Unit tests for encryption/decryption logic
- Integration tests for API endpoints
- End-to-end commitment flow tests

All core functionality is working correctly.

