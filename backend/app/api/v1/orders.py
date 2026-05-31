"""
Orders API — POST /api/v1/orders & GET /api/v1/orders/{order_id}
Handles order creation and status tracking.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random
import string

router = APIRouter()


def generate_order_id() -> str:
    return "QS-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class OrderItem(BaseModel):
    product_id: int
    size: str
    quantity: int
    price: float


class CreateOrderRequest(BaseModel):
    items: list[OrderItem]
    delivery_address: str
    coupon_code: Optional[str] = None
    location: str = "NIT Jamshedpur Campus"


class OrderResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
    estimated_delivery_minutes: int
    rider_name: str
    tracking_url: str
    created_at: str


MOCK_RIDERS = ["Arjun S.", "Priya M.", "Rahul K.", "Sneha T.", "Dev P."]


@router.post("", response_model=OrderResponse)
async def create_order(body: CreateOrderRequest):
    """Place a new order and initiate delivery dispatch."""
    order_id = generate_order_id()
    total = sum(item.price * item.quantity for item in body.items)
    
    # Apply coupon
    if body.coupon_code and body.coupon_code.upper() == "FIRST10":
        total = total * 0.90

    rider = random.choice(MOCK_RIDERS)
    eta = random.randint(9, 14)

    return OrderResponse(
        order_id=order_id,
        status="confirmed",
        total_amount=round(total, 2),
        estimated_delivery_minutes=eta,
        rider_name=rider,
        tracking_url=f"/order-status?order_id={order_id}",
        created_at=datetime.utcnow().isoformat(),
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """Retrieve the current status of an existing order."""
    # Mock response — in production, fetch from MongoDB
    return OrderResponse(
        order_id=order_id,
        status="in_transit",
        total_amount=95.00,
        estimated_delivery_minutes=random.randint(3, 8),
        rider_name=random.choice(MOCK_RIDERS),
        tracking_url=f"/order-status?order_id={order_id}",
        created_at=datetime.utcnow().isoformat(),
    )
