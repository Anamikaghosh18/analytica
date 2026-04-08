from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_endpoints():
    print("Checking / ...")
    try:
        response = client.get("/")
        print(f"Status: {response.status_code}, Body: {response.json()}")
    except Exception as e:
        print(f"Failed /: {e}")

    print("\nChecking /monitors ...")
    try:
        response = client.get("/monitors/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Found {len(response.json())} monitors")
    except Exception as e:
        print(f"Failed /monitors: {e}")

if __name__ == "__main__":
    test_endpoints()
