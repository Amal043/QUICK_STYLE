"""
Pydantic Models — Orders, Stores, Tracking, Notifications Collections
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# ── ORDERS ────────────────────────────────────────────────────────

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    dispatched = "dispatched"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"
    returned = "returned"


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    brand: str
    size: str
    color: str
    quantity: int
    unit_price: float
    total_price: float
    store_id: str
    store_name: str


class DeliveryAddress(BaseModel):
    street: str
    area: str
    city: str
    pincode: str
    lat: float
    lon: float


class OrderDocument(BaseModel):
    order_number: str                  # QS-XXXXXXXX
    user_id: str
    items: List[OrderItem]
    delivery_address: DeliveryAddress
    subtotal: float
    delivery_fee: float = 0.0
    discount: float = 0.0
    coupon_code: Optional[str] = None
    total_amount: float
    status: OrderStatus = OrderStatus.pending
    rider_id: Optional[str] = None
    rider_name: Optional[str] = None
    estimated_delivery_minutes: int = 12
    payment_method: str = "razorpay"
    payment_status: str = "pending"
    razorpay_order_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
    dispatched_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    delivery_address: DeliveryAddress
    coupon_code: Optional[str] = None
    payment_method: str = "razorpay"
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: str
    status: OrderStatus
    total_amount: float
    estimated_delivery_minutes: int
    rider_name: Optional[str] = None
    tracking_url: str
    created_at: datetime


# ── STORES (Boutiques) ────────────────────────────────────────────

class StoreDocument(BaseModel):
    name: str
    owner_id: str
    phone: str
    email: str
    address: str
    area: str
    city: str
    pincode: str
    location: Dict[str, float]        # {lat, lon}
    categories: List[str] = []
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    rating: float = 0.0
    total_orders: int = 0
    active: bool = True
    operating_hours: Dict[str, str] = {
        "open": "09:00",
        "close": "21:00"
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── TRACKING ──────────────────────────────────────────────────────

class TrackingStatus(str, Enum):
    order_confirmed = "Order Confirmed"
    preparing = "Preparing your order"
    rider_assigned = "Rider Assigned"
    picked_up = "Picked up from boutique"
    in_transit = "On the way"
    arriving = "Arriving soon"
    delivered = "Delivered!"


class RiderLocation(BaseModel):
    lat: float
    lon: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TrackingDocument(BaseModel):
    order_id: str
    rider_id: str
    rider_name: str
    rider_phone: str
    status: TrackingStatus = TrackingStatus.order_confirmed
    current_location: Optional[RiderLocation] = None
    location_history: List[RiderLocation] = []
    eta_minutes: int = 12
    progress_percent: int = 0
    delivered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── NOTIFICATIONS ─────────────────────────────────────────────────

class NotificationType(str, Enum):
    order_confirmed = "order_confirmed"
    order_dispatched = "order_dispatched"
    order_delivered = "order_delivered"
    proactive_suggestion = "proactive_suggestion"
    restock_alert = "restock_alert"
    outfit_recommendation = "outfit_recommendation"


class NotificationDocument(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    body: str
    metadata: Dict = {}
    channel: str = "whatsapp"         # whatsapp / push / email
    sent: bool = False
    read: bool = False
    sent_at: datetime = Field(default_factory=datetime.utcnow)
