"""
Pydantic Models — Products Collection
Matches the QUICK_STYLE products schema exactly.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProductPrice(BaseModel):
    mrp: float
    selling_price: float
    discount_percent: float


class ProductImages(BaseModel):
    main: str
    gallery: List[str] = []
    frames_360: List[str] = []        # 24 WebP frames, 15° apart
    has_360: bool = False


class ProductColor(BaseModel):
    name: str
    hex: str
    images: ProductImages


class ProductRating(BaseModel):
    average: float = 0.0
    count: int = 0


class StockBySize(BaseModel):
    XS: int = 0
    S: int = 0
    M: int = 0
    L: int = 0
    XL: int = 0
    XXL: int = 0


# ── Request / Response Schemas ────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: str
    brand: str
    size_variance: int = 0           # -1 runs small, 0 true, +1 runs large
    size_note: Optional[str] = None
    category: str
    subcategory: str
    tags: List[str] = []
    outfit_tags: List[str] = []
    pairs_well_with: List[str] = []
    price: ProductPrice
    sizes_available: List[str] = []
    colors: List[ProductColor] = []
    store_id: str
    store_name: str
    store_location: Dict[str, float]  # {lat, lon}
    stock: Dict[str, int] = {}
    fit_confidence_avg: int = 80
    return_policy: str = "Refund"
    return_window_days: int = 5


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    brand: str
    size_variance: int
    size_note: Optional[str] = None
    category: str
    subcategory: str
    tags: List[str] = []
    outfit_tags: List[str] = []
    pairs_well_with: List[str] = []
    price: ProductPrice
    sizes_available: List[str] = []
    colors: List[ProductColor] = []
    store_id: str
    store_name: str
    store_location: Dict[str, float]
    stock: Dict[str, int] = {}
    rating: ProductRating = ProductRating()
    fit_confidence_avg: int
    active: bool = True
    return_policy: str = "Refund"
    return_window_days: int = 5
    created_at: datetime


# ── Full DB Document ──────────────────────────────────────────────

class ProductDocument(BaseModel):
    """Full MongoDB document structure for the products collection."""
    name: str
    description: str
    brand: str
    size_variance: int = 0
    size_note: Optional[str] = None
    category: str
    subcategory: str
    tags: List[str] = []
    outfit_tags: List[str] = []
    pairs_well_with: List[str] = []
    price: ProductPrice
    sizes_available: List[str] = []
    colors: List[ProductColor] = []
    store_id: str
    store_name: str
    store_location: Dict[str, float]
    stock: Dict[str, int] = {}
    embedding: List[float] = []       # 768-dim vector for semantic search
    rating: ProductRating = ProductRating()
    fit_confidence_avg: int = 80
    return_policy: str = "Refund"
    return_window_days: int = 5
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
