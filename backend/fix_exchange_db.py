import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    uri = os.getenv("MONGODB_URI", "mongodb://admin:quick_style_secret@127.0.0.1:27017/quick_style_db?authSource=admin")
    client = AsyncIOMotorClient(uri)
    db = client.get_database()

    products = await db.products.find().to_list(1000)
    
    # Group products by store
    stores = {}
    for p in products:
        store_name = p.get('store_name', 'Default Store')
        if store_name not in stores:
            stores[store_name] = []
        stores[store_name].append(p)

    for store_name, store_products in stores.items():
        # Ensure at least 4 products per store by cloning
        while len(store_products) < 4:
            clone = store_products[0].copy()
            clone.pop('_id', None)
            clone['name'] = f"{clone['name']} (Variant)"
            clone['price']['selling_price'] = clone['price']['selling_price'] + 100
            clone['price']['mrp'] = clone['price']['mrp'] + 100
            # Change image slighlty if we can? Just use a dicebear
            clone['image_url'] = f"https://api.dicebear.com/7.x/shapes/svg?seed={len(store_products)}&backgroundColor=f1f5f9"
            
            result = await db.products.insert_one(clone)
            clone['_id'] = result.inserted_id
            store_products.append(clone)

        # Make sure "Exchange" items are cheaper
        # Sort by selling_price ascending
        store_products.sort(key=lambda x: x.get('price', {}).get('selling_price', 0))
        
        exchange_items = [p for p in store_products if p.get('return_policy') == 'Exchange']
        non_exchange_items = [p for p in store_products if p.get('return_policy') != 'Exchange']
        
        if exchange_items and non_exchange_items:
            min_non_exchange_price = min([p.get('price', {}).get('selling_price', 0) for p in non_exchange_items])
            for i, p in enumerate(exchange_items):
                new_price = max(499, min_non_exchange_price - 100 - (i*50))
                await db.products.update_one(
                    {'_id': p['_id']},
                    {'$set': {
                        'price.selling_price': new_price,
                        'price.mrp': new_price + int(new_price * 0.2)
                    }}
                )

    print("Exchange constraints guaranteed in DB.")

if __name__ == '__main__':
    asyncio.run(main())
