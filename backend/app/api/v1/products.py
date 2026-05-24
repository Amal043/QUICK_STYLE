"""
Products API — GET /api/v1/products
Serves the local boutique product catalog with fit calibration data.
"""

from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class Product(BaseModel):
    id: int
    name: str
    price: float
    category: str
    boutique: str
    distance: float
    fitAccuracy: int
    stock: int
    rating: float
    reviewsCount: int
    description: str
    image: str


# Mock catalog — replace with MongoDB motor queries when backend is live
MOCK_PRODUCTS: list[Product] = [
    Product(
        id=1, name="Apex Tech Hoodie",
        price=79.00, category="Streetwear", boutique="Boutique A",
        distance=0.8, fitAccuracy=94, stock=3, rating=4.9, reviewsCount=148,
        description="Premium fleece-lined tech hoodie with mesh ventilation panels.",
        image=""
    ),
    Product(
        id=2, name="Vanguard Utility Jacket",
        price=149.00, category="Streetwear", boutique="Boutique B",
        distance=1.2, fitAccuracy=92, stock=1, rating=4.8, reviewsCount=89,
        description="Military-inspired multi-pocket techwear jacket.",
        image=""
    ),
    Product(
        id=3, name="Amethyst Knit Sweater",
        price=95.00, category="Loungewear", boutique="Boutique C",
        distance=0.5, fitAccuracy=96, stock=5, rating=4.7, reviewsCount=201,
        description="Luxurious merino blend knit with relaxed silhouette.",
        image=""
    ),
    Product(
        id=4, name="Aero-Knit Activewear Tee",
        price=45.00, category="Activewear", boutique="Boutique D",
        distance=1.9, fitAccuracy=98, stock=8, rating=4.6, reviewsCount=320,
        description="High-performance moisture-wicking activewear top.",
        image=""
    ),
    Product(
        id=5, name="Obsidian Formal Blazer",
        price=199.00, category="Formals", boutique="Boutique A",
        distance=0.8, fitAccuracy=93, stock=2, rating=4.9, reviewsCount=67,
        description="Tailored single-breasted blazer in premium obsidian wool.",
        image=""
    ),
]


@router.get("/", response_model=list[Product])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    boutique: Optional[str] = Query(None, description="Filter by boutique"),
    in_stock: bool = Query(False, description="Show only in-stock items"),
):
    """Retrieve the live local boutique product catalog."""
    results = MOCK_PRODUCTS.copy()

    if category:
        results = [p for p in results if p.category.lower() == category.lower()]
    if boutique:
        results = [p for p in results if p.boutique.lower() == boutique.lower()]
    if in_stock:
        results = [p for p in results if p.stock > 0]

    return results


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Retrieve a single product by ID."""
    for product in MOCK_PRODUCTS:
        if product.id == product_id:
            return product
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Product not found")
