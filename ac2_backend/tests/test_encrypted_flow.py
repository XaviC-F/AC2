import requests
import time
from threading import Thread
import uvicorn
import sys
import os

# Add project root to python path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ac2_backend.backend_encrypted import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="critical")

def test_encrypted_backend():
    print("Starting server...")
    server_thread = Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server to start

    base_url = "http://127.0.0.1:8001"

    print("\n1. Testing Setup...")
    names = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
    setup_resp = requests.post(f"{base_url}/setup", json={
        "names": names,
        "min_count": 2
    })
    print(f"Setup Response: {setup_resp.json()}")
    assert setup_resp.status_code == 200

    print("\n2. Testing Commit (Alice, threshold 3)...")
    # Alice needs 2 others (total 3) to reveal.
    commit_alice = requests.post(f"{base_url}/commit", json={
        "name": "Alice",
        "threshold": 3
    })
    print(f"Alice Commit: {commit_alice.json().keys()}")
    data = commit_alice.json()
    assert "points" in data
    assert isinstance(data["points"], list)
    # Check that points are (x, y)
    assert len(data["points"]) == len(names)
    assert len(data["points"][0]) == 2

    print("\n3. Testing Decrypt (Should be empty)...")
    decrypt_1 = requests.get(f"{base_url}/decrypt")
    print(f"Decrypt 1: {decrypt_1.json()}")
    assert decrypt_1.json()["revealed_names"] == []

    print("\n4. Testing Commit (Bob, threshold 3)...")
    commit_bob = requests.post(f"{base_url}/commit", json={
        "name": "Bob",
        "threshold": 3
    })
    
    print("\n5. Testing Decrypt (Should still be empty, need 3)...")
    decrypt_2 = requests.get(f"{base_url}/decrypt")
    print(f"Decrypt 2: {decrypt_2.json()}")
    assert decrypt_2.json()["revealed_names"] == []

    print("\n6. Testing Commit (Charlie, threshold 3)...")
    commit_charlie = requests.post(f"{base_url}/commit", json={
        "name": "Charlie",
        "threshold": 3
    })

    print("\n7. Testing Decrypt (Should reveal Alice, Bob, Charlie)...")
    decrypt_3 = requests.get(f"{base_url}/decrypt")
    print(f"Decrypt 3: {decrypt_3.json()}")
    revealed = decrypt_3.json()["revealed_names"]
    assert "Alice" in revealed
    assert "Bob" in revealed
    assert "Charlie" in revealed
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    try:
        test_encrypted_backend()
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()

