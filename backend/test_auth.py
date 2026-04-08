import requests
import json
import random
import string

BASE_URL = "http://127.0.0.1:8000"

def random_email():
    return "".join(random.choices(string.ascii_lowercase, k=8)) + "@example.com"

def test_auth():
    email = random_email()
    password = "testpassword123"
    
    print(f"1. Registering user: {email}")
    reg_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": password}
    )
    print(f"Status: {reg_response.status_code}")
    if reg_response.status_code != 200:
        print(f"Error: {reg_response.text}")
        return

    print("\n2. Logging in to get token")
    login_response = requests.post(
        f"{BASE_URL}/auth/token",
        data={"username": email, "password": password}
    )
    print(f"Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"Error: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    print(f"Token received! (first 10 chars: {token[:10]}...)")

    print("\n3. Testing protected route (Create Monitor)")
    headers = {"Authorization": f"Bearer {token}"}
    mon_response = requests.post(
        f"{BASE_URL}/monitors/",
        headers=headers,
        json={"name": "Auth Test Site", "url": "https://example.com"}
    )
    print(f"Status: {mon_response.status_code}")
    if mon_response.status_code == 200:
        print(f"Monitor created: {mon_response.json()['name']} with owner_id {mon_response.json()['owner_id']}")

    print("\n4. Testing unauthorized access")
    unauth_response = requests.get(f"{BASE_URL}/monitors/")
    print(f"Status: {unauth_response.status_code} (Expected: 401)")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print(f"Test failed: {e}")
