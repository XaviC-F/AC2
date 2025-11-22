# AC2 - Assurance Contract Commitments

A privacy-preserving commitment platform that allows people to commit to actions conditionally based on how many others are willing to participate.

## Quick Start

### Setup
```bash
./setup.sh
```

### Run Regular Backend
```bash
./start-server.sh
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Commitments are stored in plaintext

### Run Encrypted Backend
```bash
./run-encrypted-server.sh
```
- Encrypted Backend: `http://localhost:8001`
- Frontend: `http://localhost:3000` (auto-configured for encrypted backend)
- Commitments are encrypted using polynomial secret sharing

Press **Ctrl+C** to stop any running server.

## What's the Difference?

| Feature | Regular Backend | Encrypted Backend |
|---------|----------------|-------------------|
| **Port** | 8000 | 8001 |
| **Privacy** | Names visible immediately | Names encrypted until threshold met |
| **Storage** | Plaintext in MongoDB | Encrypted ciphertext + polynomial shares |
| **Revelation** | Based on threshold logic | Based on cryptographic decryption |
| **Use Case** | Testing, development | Production, privacy-critical scenarios |

## How It Works

1. **Create an Objective** - Define a goal and invite people
2. **Submit Commitments** - Each person commits with their threshold (minimum number of people needed)
3. **Automatic Revelation** - When enough people commit at compatible thresholds, names are revealed

### Example
- Alice commits: "I'll go if 3 people are going" (threshold = 3)
- Bob commits: "I'll go if 3 people are going" (threshold = 3)
- Charlie commits: "I'll go if 3 people are going" (threshold = 3)
- ✅ **Result**: All three are revealed because 3 people met the threshold of 3

## Architecture

```
AC2/
├── ac2_backend/          # Python FastAPI backends
│   ├── backend.py        # Regular backend (port 8000)
│   ├── backend_encrypted.py  # Encrypted backend (port 8001)
│   └── core/             # Threshold logic & encryption
├── ac2_frontend/         # Next.js React frontend
│   └── src/
├── start-server.sh       # Run regular backend + frontend
└── run-encrypted-server.sh  # Run encrypted backend + frontend
```

## Requirements

- **Python**: 3.13+
- **Node.js**: 18+
- **MongoDB**: Running on localhost:27017
- **Package Managers**: npm/pnpm (for frontend)

## API Documentation

When running, visit:
- Regular: `http://localhost:8000/docs`
- Encrypted: `http://localhost:8001/docs`

## Development

### Backend
```bash
cd ac2_backend
source ../bin/activate
uvicorn backend:app --reload --port 8000          # Regular
uvicorn backend_encrypted:app --reload --port 8001  # Encrypted
```

### Frontend
```bash
cd ac2_frontend
npm run dev  # or pnpm dev
```

## Testing

The encrypted backend has been thoroughly tested with unit tests, integration tests, and end-to-end scenarios. All core functionality is working correctly.

## Privacy & Security

The encrypted backend uses:
- **Polynomial Secret Sharing** - Names are encrypted as shares of a polynomial
- **Threshold Cryptography** - Decryption only succeeds when threshold conditions are met
- **Deterministic Encryption** - Uses per-objective seeds for reproducibility (testing/debugging)
- **127-bit Modulus** - Uses Mersenne prime 2^127 - 1 for polynomial operations

See [ac2_backend/README_ENCRYPTED.md](ac2_backend/README_ENCRYPTED.md) for detailed documentation.

## License

MIT
