from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.user import UserResponse, Address

router = APIRouter()

# Mocked DB instance for users since we don't have a real auth token session
class MockDB:
    users = {
        "admin@quickstyle.io": {
            "id": "usr_admin_123",
            "name": "Admin Executive",
            "email": "admin@quickstyle.io",
            "role": "admin",
            "addresses": [
                {
                    "label": "Office HQ",
                    "street": "Admin Block 4, DLF",
                    "area": "Cyber City",
                    "city": "Gurugram",
                    "pincode": "122002",
                    "location": {"lat": 28.4595, "lon": 77.0266},
                    "is_default": True
                }
            ],
            "wishlist": [],
            "created_at": datetime.utcnow()
        },
        "customer@example.com": {
            "id": "usr_cust_456",
            "name": "Customer",
            "email": "customer@example.com",
            "role": "customer",
            "addresses": [
                {
                    "label": "Home",
                    "street": "Saptarshi Appartment, near mohila society",
                    "area": "NIT",
                    "city": "Jamshedpur",
                    "pincode": "831014",
                    "location": {"lat": 22.7761, "lon": 86.1436},
                    "is_default": True
                }
            ],
            "wishlist": ["prod_103", "prod_105"],
            "created_at": datetime.utcnow()
        }
    }

class WishlistToggleRequest(BaseModel):
    email: str

@router.get("/me", response_model=UserResponse)
async def get_my_profile(email: str = "customer@example.com"):
    """Fetch the currently logged in user based on email (mocked auth token)"""
    user = MockDB.users.get(email)
    if not user:
        # Default fallback
        user = MockDB.users.get("customer@example.com")
    return user

@router.post("/wishlist/{product_id}")
async def toggle_wishlist(product_id: str, request: WishlistToggleRequest):
    """Toggle a product in the user's wishlist."""
    user = MockDB.users.get(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if product_id in user["wishlist"]:
        user["wishlist"].remove(product_id)
        action = "removed"
    else:
        user["wishlist"].append(product_id)
        action = "added"
        
    return {"status": "success", "action": action, "wishlist": user["wishlist"]}
