# AC2 - Assurance Contract Commitments

A privacy-preserving commitment platform that allows people to commit to actions conditionally based on how many others are willing to participate.

## Quick Start

### Setup
```bash
./setup.sh
```

### Run Server
```bash
./start-server.sh
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

Press **Ctrl+C** to stop any running server.

## How It Works

1. **Create an Objective** - Define a goal and invite people
2. **Submit Commitments** - Each person commits with their threshold (minimum number of people needed)
3. **Automatic Revelation** - When enough people commit at compatible thresholds, names are revealed

### Example
- Alice commits: "I'll go if 3 people are going" (threshold = 3)
- Bob commits: "I'll go if 3 people are going" (threshold = 3)
- Charlie commits: "I'll go if 3 people are going" (threshold = 3)
- ✅ **Result**: All three are revealed because 3 people met the threshold of 3

## Privacy & Security

This platform uses **Threshold Cryptography** to ensure commitments remain private until the conditions are met.

- **Polynomial Secret Sharing** - Names are encrypted as shares of a polynomial
- **Threshold Revelation** - Decryption only succeeds when threshold conditions are met
- **Deterministic Encryption** - Uses per-objective seeds for reproducibility
- **127-bit Modulus** - Uses Mersenne prime 2^127 - 1 for polynomial operations

## Architecture

```
AC2/
├── ac2_backend/          # Python FastAPI backend
│   ├── backend.py        # Main application
│   └── core/             # Threshold logic & encryption
├── ac2_frontend/         # Next.js React frontend
│   └── src/
└── start-server.sh       # Run backend + frontend
```

## Requirements

- **Python**: 3.13+
- **Node.js**: 18+
- **MongoDB**: Running on localhost:27017
- **Package Managers**: npm/pnpm (for frontend)

## API Documentation

When running, visit: `http://localhost:8000/docs`

## Development

### Backend
```bash
cd ac2_backend
source ../bin/activate
uvicorn backend:app --reload --port 8000
```

### Frontend
```bash
cd ac2_frontend
npm run dev  # or pnpm dev
```

## License

MIT
