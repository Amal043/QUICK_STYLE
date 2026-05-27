from app.db.connection import get_db
import re

async def hybrid_search(query: str, location: dict = None, filters: dict = None, top_k: int = 5):
    """
    Mocking hybrid search to use MongoDB for the hackathon prototype.
    """
    db = get_db()
    if db is None:
        return []

    search_filter = {"active": True}
    
    if filters:
        if filters.get("size"):
            search_filter["sizes_available"] = filters["size"]
        if filters.get("exclude_brands"):
            search_filter["brand"] = {"$nin": filters["exclude_brands"]}
        # Simplified budget filter
        if filters.get("max_price"):
            try:
                budget = float(re.sub(r'[^\d.]', '', str(filters["max_price"])))
                search_filter["price.selling_price"] = {"$lte": budget}
            except ValueError:
                pass

    # Simple text search (requires text index)
    if query:
        search_filter["$text"] = {"$search": query}
        cursor = db.products.find(
            search_filter, 
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(top_k)
    else:
        cursor = db.products.find(search_filter).limit(top_k)

    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # Mock confidence score
        doc["_score"] = doc.get("score", 0.85)
        results.append(doc)
        
    return results
