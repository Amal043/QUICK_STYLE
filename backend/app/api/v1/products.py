"""
Products API — Real MongoDB Atlas queries
GET  /api/v1/products          — list with filters
GET  /api/v1/products/search   — text search
GET  /api/v1/products/nearby   — geo radius query
GET  /api/v1/products/{id}     — single product
POST /api/v1/products          — create product
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional
from bson import ObjectId
from app.db.connection import get_db
from app.models.product import ProductCreate, ProductResponse
from datetime import datetime

router = APIRouter()


def doc_to_product(doc: dict) -> dict:
    """Convert MongoDB document to API response format."""
    doc["id"] = str(doc.pop("_id"))
    if "store_id" in doc and isinstance(doc["store_id"], ObjectId):
        doc["store_id"] = str(doc["store_id"])
    return doc


@router.get("/", response_model=list[dict])
async def get_products(
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    in_stock: bool = Query(False),
    min_fit_score: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),   # created_at | price | rating | fit_score
    limit: int = Query(20, le=100),
    skip: int = Query(0),
    db=Depends(get_db),
):
    """Retrieve products with optional filters from MongoDB Atlas."""
    query: dict = {"active": True}

    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if subcategory:
        query["subcategory"] = {"$regex": subcategory, "$options": "i"}
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    if min_price is not None:
        query.setdefault("price.selling_price", {})["$gte"] = min_price
    if max_price is not None:
        query.setdefault("price.selling_price", {})["$lte"] = max_price
    if in_stock:
        query["$expr"] = {"$gt": [{"$sum": {"$objectToArray": "$stock"}}, 0]}
    if min_fit_score is not None:
        query["fit_confidence_avg"] = {"$gte": min_fit_score}

    sort_map = {
        "created_at": [("created_at", -1)],
        "price":      [("price.selling_price", 1)],
        "price_desc": [("price.selling_price", -1)],
        "rating":     [("rating.average", -1)],
        "fit_score":  [("fit_confidence_avg", -1)],
    }
    sort = sort_map.get(sort_by, [("created_at", -1)])

    cursor = db.products.find(query).sort(sort).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [doc_to_product(doc) for doc in docs]


@router.get("/search", response_model=list[dict])
async def search_products(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, le=50),
    db=Depends(get_db),
):
    """Full-text search across name, description, and tags."""
    cursor = db.products.find(
        {"$text": {"$search": q}, "active": True},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(limit)

    docs = await cursor.to_list(length=limit)
    return [doc_to_product(doc) for doc in docs]


@router.get("/nearby", response_model=list[dict])
async def get_nearby_products(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(5.0, le=20),
    category: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db=Depends(get_db),
):
    """Geo-radius search — find products from nearby boutiques."""
    query: dict = {
        "store_location": {
            "$near": {
                "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                "$maxDistance": radius_km * 1000,  # metres
            }
        },
        "active": True,
    }
    if category:
        query["category"] = {"$regex": category, "$options": "i"}

    cursor = db.products.find(query).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [doc_to_product(doc) for doc in docs]


@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str, db=Depends(get_db)):
    """Retrieve a single product by MongoDB ObjectId."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc_to_product(doc)


@router.post("/", response_model=dict, status_code=201)
async def create_product(body: ProductCreate, db=Depends(get_db)):
    """Create a new product listing (shopkeeper/admin use)."""
    product_dict = body.model_dump()
    product_dict["rating"] = {"average": 0.0, "count": 0}
    product_dict["embedding"] = []
    product_dict["active"] = True
    product_dict["created_at"] = datetime.utcnow()

    result = await db.products.insert_one(product_dict)
    doc = await db.products.find_one({"_id": result.inserted_id})
    return doc_to_product(doc)
