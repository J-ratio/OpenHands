import json
from pathlib import Path
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openhands.server.dependencies import get_dependencies
from openhands.core.logger import openhands_logger as logger

app = APIRouter(prefix='/api', dependencies=get_dependencies())

class HomepageTool(BaseModel):
    id: str
    name: str
    description: str
    image: str
    category: str
    linked_repo_required: bool = False

class HomepageToolsResponse(BaseModel):
    status: str
    categories: list[str]
    tools: list[HomepageTool]
    message: str | None = None


@app.get("/homepage-tools", response_model=HomepageToolsResponse)
async def get_homepage_tools():
    try:
        current_dir = Path(__file__).parent
        json_file_path = current_dir.parent / "data" / "homepage_tools.json"

        if not json_file_path.exists():
            logger.error(f"Homepage tools data file not found: {json_file_path}")
            return JSONResponse(
                content={
                    "status": "error",
                    "message": "Homepage tools data file not found",
                    "categories": [],
                    "tools": []
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        with open(json_file_path, 'r') as file:
            data = json.load(file)

        categories = [category_data["category"] for category_data in data["categories"]]

        all_tools = []
        for category_data in data["categories"]:
            category_name = category_data["category"]
            for tool in category_data["tools"]:
                homepage_tool = HomepageTool(
                    id=tool["id"],
                    name=tool["name"],
                    description=tool["description"],
                    image=tool["image"],
                    category=category_name,
                    linked_repo_required=tool.get("linked_repo_required", False)
                )
                all_tools.append(homepage_tool)

        return HomepageToolsResponse(
            status="success",
            categories=categories,
            tools=all_tools
        )
    except json.JSONDecodeError as e:
        error_message = f"Invalid JSON format in homepage tools data file: {str(e)}"
        logger.error(error_message)
        return JSONResponse(
            content={
                "status": "error",
                "message": error_message,
                "categories": [],
                "tools": []
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        error_message = f"Error loading homepage tools data: {str(e)}"
        logger.error(error_message)
        return JSONResponse(
            content={
                "status": "error",
                "message": error_message,
                "categories": [],
                "tools": []
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
