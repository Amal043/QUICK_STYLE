import os
import re
import google.generativeai as genai
from app.db.connection import get_db
from elasticsearch import AsyncElasticsearch

# Setup Gemini API key
if os.getenv("GOOGLE_API_KEY"):
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize elasticsearch client if credentials exist
es_client = None
elastic_url = os.getenv("ELASTIC_URL") or os.getenv("ELASTIC_HOST")
elastic_api_key = os.getenv("ELASTIC_API_KEY")

if elastic_url:
    try:
        if elastic_api_key:
            es_client = AsyncElasticsearch(elastic_url, api_key=elastic_api_key)
        else:
            es_client = AsyncElasticsearch(elastic_url)
    except Exception as e:
        print(f"Failed to initialize Elasticsearch client: {e}")


async def hybrid_search(query: str, location: dict = None, filters: dict = None, top_k: int = 5):
    """
    Run hybrid search (combining BM25 text match & vector embedding).
    Attempts Elastic Search first (if configured), then MongoDB Atlas Vector Search, 
    and finally falls back to MongoDB full-text search.
    """
    # 1. Generate Query Embeddings natively using Gemini SDK
    query_vector = []
    if query:
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                contents=query,
                task_type="retrieval_query",
            )
            query_vector = result.get('embedding', [])
        except Exception as e:
            print(f"Embedding generation failed: {e}")

    # 2. Try Elastic Search if configured
    if es_client and query:
        try:
            es_query = {
                "size": top_k,
                "query": {
                    "bool": {
                        "must": [
                            {"multi_match": {"query": query, "fields": ["name^2", "description", "tags"]}}
                        ],
                        "filter": [
                            {"term": {"active": True}}
                        ]
                    }
                }
            }
            if filters:
                if filters.get("size"):
                    es_query["query"]["bool"]["filter"].append({"term": {"sizes_available": filters["size"]}})
                if filters.get("exclude_brands"):
                    es_query["query"]["bool"]["filter"].append({"must_not": {"terms": {"brand": filters["exclude_brands"]}}})
                if filters.get("max_price"):
                    try:
                        budget = float(re.sub(r'[^\d.]', '', str(filters["max_price"])))
                        es_query["query"]["bool"]["filter"].append({"range": {"price.selling_price": {"lte": budget}}})
                    except ValueError:
                        pass

            if query_vector:
                es_query["knn"] = {
                    "field": "embedding",
                    "query_vector": query_vector,
                    "k": top_k,
                    "num_candidates": 50
                }

            response = await es_client.search(index="products", body=es_query)
            hits = response.get("hits", {}).get("hits", [])
            if hits:
                results = []
                for hit in hits:
                    source = hit["_source"]
                    source["id"] = hit["_id"]
                    source["_id"] = hit["_id"]
                    source["_score"] = hit["_score"]
                    results.append(source)
                return results
        except Exception as e:
            print(f"Elasticsearch search failed: {e}")

    # 3. Try MongoDB Atlas Vector Search
    db = get_db()
    if db is not None and query_vector:
        try:
            filter_conditions = {"active": True}
            if filters:
                if filters.get("size"):
                    filter_conditions["sizes_available"] = filters["size"]
                if filters.get("exclude_brands"):
                    filter_conditions["brand"] = {"$nin": filters["exclude_brands"]}
                if filters.get("max_price"):
                    try:
                        budget = float(re.sub(r'[^\d.]', '', str(filters["max_price"])))
                        filter_conditions["price.selling_price"] = {"$lte": budget}
                    except ValueError:
                        pass

            vector_search_stage = {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": top_k * 10,
                    "limit": top_k,
                    "filter": filter_conditions
                }
            }

            cursor = db.products.aggregate([
                vector_search_stage,
                {
                    "$addFields": {
                        "score": {"$meta": "searchScore"}
                    }
                }
            ])
            results = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                doc["_score"] = doc.get("score", 0.9)
                results.append(doc)
            if results:
                return results
        except Exception as e:
            print(f"Atlas Vector Search failed, falling back to text search: {e}")

    # 4. Final Fallback: MongoDB Text Search
    if db is None:
        return []

    search_filter = {"active": True}
    if filters:
        if filters.get("size"):
            search_filter["sizes_available"] = filters["size"]
        if filters.get("exclude_brands"):
            search_filter["brand"] = {"$nin": filters["exclude_brands"]}
        if filters.get("max_price"):
            try:
                budget = float(re.sub(r'[^\d.]', '', str(filters["max_price"])))
                search_filter["price.selling_price"] = {"$lte": budget}
            except ValueError:
                pass

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
        doc["_score"] = doc.get("score", 0.85)
        results.append(doc)
        
    return results
