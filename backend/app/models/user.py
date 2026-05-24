"""
Pydantic Models — Users Collection
Matches the QUICK_STYLE users schema exactly.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    customer = "customer"
    shopkeeper = "shopkeeper"
    admin = "admin"
    rider = "rider"


class GeoLocation(BaseModel):
    lat: float
    lon: float


class Address(BaseModel):
    label: str = "Home"               # Home / Work / Other
    street: str
    area: str
    city: str
    pincode: str
    location: GeoLocation
    is_default: bool = False


class SizeProfile(BaseModel):
    tops: Optional[str] = None        # XS / S / M / L / XL
    bottoms: Optional[str] = None
    footwear: Optional[str] = None    # UK size e.g. "7"
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None


class ReturnHistory(BaseModel):
    product_id: str
    brand: str
    category: str
    size_bought: str
    reason: str                        # poor_fit / wrong_item / damaged / other
    fit_issue: Optional[str] = None   # runs_small / runs_large / poor_quality
    date: datetime


class PurchaseHistory(BaseModel):
    product_id: str
    category: str
    subcategory: str
    brand: str
    purchased_at: datetime
    season: Optional[str] = None       # festive / summer / winter / monsoon


class NotificationPrefs(BaseModel):
    whatsapp_enabled: bool = True
    proactive_suggestions: bool = True
    last_notified_at: Optional[datetime] = None


class PaymentPreauth(BaseModel):
    limit_rupees: float = 3000
    used_rupees: float = 0
    expires_at: Optional[datetime] = None
    razorpay_token: Optional[str] = None


# ── Request / Response Schemas ────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.customer


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_photo_url: Optional[str] = None
    addresses: Optional[List[Address]] = None
    size_profile: Optional[SizeProfile] = None
    notification_prefs: Optional[NotificationPrefs] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    profile_photo_url: Optional[str] = None
    addresses: List[Address] = []
    size_profile: Optional[SizeProfile] = None
    purchase_history: List[PurchaseHistory] = []
    notification_prefs: Optional[NotificationPrefs] = None
    created_at: datetime
    last_active: Optional[datetime] = None


# ── Full DB Document (internal use) ──────────────────────────────

class UserDocument(BaseModel):
    """Full MongoDB document structure for the users collection."""
    name: str
    email: str
    phone: Optional[str] = None
    password_hash: str
    role: UserRole = UserRole.customer
    profile_photo_url: Optional[str] = None
    addresses: List[Address] = []
    size_profile: Optional[SizeProfile] = None
    return_history: List[ReturnHistory] = []
    purchase_history: List[PurchaseHistory] = []
    notification_prefs: NotificationPrefs = NotificationPrefs()
    payment_preauth: Optional[PaymentPreauth] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: Optional[datetime] = None
