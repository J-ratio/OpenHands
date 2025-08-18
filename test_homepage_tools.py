import json
import os
import shutil
from fastapi.testclient import TestClient
from openhands.server.routes.homepage import app

client = TestClient(app)

def test_get_homepage_tools():
    # Test successful response
    response = client.get("/api/homepage-tools")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["categories"]) > 0
    assert len(data["tools"]) > 0
    print(json.dumps(data, indent=2))
    print(f"Found {len(data['categories'])} categories and {len(data['tools'])} tools")

    # Verify that the data matches the JSON file
    json_file_path = os.path.join("openhands", "server", "data", "homepage_tools.json")

    with open(json_file_path, 'r') as file:
        json_data = json.load(file)

    # Check that all categories from the JSON file are in the response
    json_categories = [category["category"] for category in json_data["categories"]]
    assert set(data["categories"]) == set(json_categories)

    # Check that all tools from the JSON file are in the response
    json_tool_ids = []
    for category in json_data["categories"]:
        for tool in category["tools"]:
            json_tool_ids.append(tool["id"])

    response_tool_ids = [tool["id"] for tool in data["tools"]]
    assert set(response_tool_ids) == set(json_tool_ids)

    print("Verified that API response matches the JSON file data")

def test_error_handling():
    # Test file not found error
    # Temporarily rename the JSON file to simulate a missing file
    json_file_path = os.path.join("openhands", "server", "data", "homepage_tools.json")
    backup_path = json_file_path + ".backup"

    try:
        # Backup the file
        shutil.copy(json_file_path, backup_path)

        # Remove the original file
        os.remove(json_file_path)

        # Test the API response when file is missing
        response = client.get("/api/homepage-tools")
        assert response.status_code == 404
        data = response.json()
        assert data["status"] == "error"
        assert "message" in data
        assert "Homepage tools data file not found" in data["message"]
        print("File not found error test passed")

    finally:
        # Restore the file
        if os.path.exists(backup_path):
            shutil.copy(backup_path, json_file_path)
            os.remove(backup_path)

    # Test JSON decode error
    # Create a temporary invalid JSON file
    invalid_json_path = json_file_path + ".invalid"

    try:
        # Create an invalid JSON file
        with open(invalid_json_path, 'w') as file:
            file.write('{"categories": [{"category": "Invalid JSON')

        # Backup the original file
        shutil.copy(json_file_path, backup_path)

        # Replace with invalid JSON
        shutil.copy(invalid_json_path, json_file_path)

        # Test the API response with invalid JSON
        response = client.get("/api/homepage-tools")
        assert response.status_code == 500
        data = response.json()
        assert data["status"] == "error"
        assert "message" in data
        assert "Invalid JSON format" in data["message"]
        print("Invalid JSON error test passed")

    finally:
        # Restore the file
        if os.path.exists(backup_path):
            shutil.copy(backup_path, json_file_path)
            os.remove(backup_path)
        if os.path.exists(invalid_json_path):
            os.remove(invalid_json_path)

if __name__ == "__main__":
    print("Testing successful response:")
    test_get_homepage_tools()
    print("\nTesting error handling:")
    test_error_handling()
