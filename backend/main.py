from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random

app = FastAPI(title="Aura Virtual Try-On API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Catalog Data ───────────────────────────────────────────────────────────────
CATALOG = {
    "eyewear": [
        {"id": "e1", "name": "Classic Aviator",  "price": 129, "shape": "aviator",   "frameColor": "#c8a96b", "lensColor": "rgba(180,160,80,0.38)",  "accent": "#f5c842", "tag": "Pilot",    "category": "eyewear"},
        {"id": "e2", "name": "Wayfarer",          "price": 99,  "shape": "square",    "frameColor": "#1a1a1a", "lensColor": "rgba(20,20,20,0.55)",    "accent": "#9ca3af", "tag": "Classic",  "category": "eyewear"},
        {"id": "e3", "name": "Round Vintage",     "price": 119, "shape": "round",     "frameColor": "#7c2d12", "lensColor": "rgba(160,80,30,0.38)",   "accent": "#f97316", "tag": "Vintage",  "category": "eyewear"},
        {"id": "e4", "name": "Cat-Eye Glam",      "price": 145, "shape": "cateye",    "frameColor": "#4a044e", "lensColor": "rgba(180,0,230,0.3)",    "accent": "#e879f9", "tag": "Glam",     "category": "eyewear"},
        {"id": "e5", "name": "Sports Shield",     "price": 89,  "shape": "shield",    "frameColor": "#042f2e", "lensColor": "rgba(0,200,180,0.4)",    "accent": "#2dd4bf", "tag": "Sport",    "category": "eyewear"},
        {"id": "e6", "name": "Cyber Hex",         "price": 159, "shape": "hex",       "frameColor": "#0f0f1a", "lensColor": "rgba(0,255,255,0.25)",   "accent": "#00ffff", "tag": "Cyber",    "category": "eyewear"},
        {"id": "e7", "name": "Slim Rimless",      "price": 79,  "shape": "rimless",   "frameColor": "#aaa",    "lensColor": "rgba(200,200,255,0.2)",  "accent": "#c7d2fe", "tag": "Minimal",  "category": "eyewear"},
        {"id": "e8", "name": "Oversized Boss",    "price": 135, "shape": "oversized", "frameColor": "#1c1917", "lensColor": "rgba(40,20,0,0.5)",      "accent": "#d97706", "tag": "Fashion",  "category": "eyewear"},
        {"id": "e9", "name": "Rose Gold",         "price": 115, "shape": "round",     "frameColor": "#c4746c", "lensColor": "rgba(220,150,130,0.3)",  "accent": "#fb7185", "tag": "Elegant",  "category": "eyewear"},
        {"id": "e10","name": "Blue Light",        "price": 95,  "shape": "square",    "frameColor": "#1e3a5f", "lensColor": "rgba(100,150,255,0.15)", "accent": "#60a5fa", "tag": "Work",     "category": "eyewear"},
    ],
    "tops": [
        {"id": "t1", "name": "Urban Hoodie",    "price": 85,  "color": "#1e293b", "accent": "#38bdf8", "tag": "Casual",      "category": "tops"},
        {"id": "t2", "name": "Blazer Elite",    "price": 195, "color": "#1c1917", "accent": "#f59e0b", "tag": "Formal",      "category": "tops"},
        {"id": "t3", "name": "Graphic Tee",     "price": 45,  "color": "#1a1a2e", "accent": "#a855f7", "tag": "Street",      "category": "tops"},
        {"id": "t4", "name": "Leather Jacket",  "price": 285, "color": "#0c0a09", "accent": "#ef4444", "tag": "Edge",        "category": "tops"},
        {"id": "t5", "name": "Sports Jersey",   "price": 65,  "color": "#052e16", "accent": "#22c55e", "tag": "Sport",       "category": "tops"},
        {"id": "t6", "name": "Denim Shirt",     "price": 75,  "color": "#0c1d3b", "accent": "#60a5fa", "tag": "Denim",       "category": "tops"},
        {"id": "t7", "name": "Saree Drape",     "price": 220, "color": "#3b0764", "accent": "#c084fc", "tag": "Traditional", "category": "tops"},
        {"id": "t8", "name": "Floral Dress",    "price": 110, "color": "#1a0535", "accent": "#f472b6", "tag": "Boho",        "category": "tops"},
    ],
    "bottoms": [
        {"id": "b1", "name": "Slim Jeans",   "price": 95, "color": "#1e3a5f", "accent": "#60a5fa", "tag": "Casual", "style": "pants",  "category": "bottoms"},
        {"id": "b2", "name": "Cargo Pants",  "price": 85, "color": "#1a2e1a", "accent": "#4ade80", "tag": "Street", "style": "pants",  "category": "bottoms"},
        {"id": "b3", "name": "Chinos",       "price": 79, "color": "#3d2b1f", "accent": "#d97706", "tag": "Smart",  "style": "pants",  "category": "bottoms"},
        {"id": "b4", "name": "Mini Skirt",   "price": 55, "color": "#3b0764", "accent": "#c084fc", "tag": "Glam",   "style": "skirt",  "category": "bottoms"},
        {"id": "b5", "name": "Shorts",       "price": 49, "color": "#0c2340", "accent": "#38bdf8", "tag": "Sport",  "style": "shorts", "category": "bottoms"},
        {"id": "b6", "name": "Maxi Skirt",   "price": 69, "color": "#1c0a28", "accent": "#e879f9", "tag": "Boho",   "style": "skirt",  "category": "bottoms"},
        {"id": "b7", "name": "Trousers",     "price": 99, "color": "#111827", "accent": "#f59e0b", "tag": "Formal", "style": "pants",  "category": "bottoms"},
        {"id": "b8", "name": "Leggings",     "price": 45, "color": "#0f172a", "accent": "#818cf8", "tag": "Active", "style": "pants",  "category": "bottoms"},
    ],
    "outfits": [
        {"id": "o1", "name": "Street King", "price": 175, "topColor": "#1e293b", "bottomColor": "#1a2e1a", "bottomStyle": "pants", "accent": "#38bdf8", "tag": "Street", "category": "outfits"},
        {"id": "o2", "name": "Power Suit",  "price": 340, "topColor": "#1c1917", "bottomColor": "#111827", "bottomStyle": "pants", "accent": "#f59e0b", "tag": "Formal", "category": "outfits"},
        {"id": "o3", "name": "Sport Mode", "price": 130, "topColor": "#052e16", "bottomColor": "#0c2340", "bottomStyle": "shorts","accent": "#22c55e", "tag": "Sport",  "category": "outfits"},
        {"id": "o4", "name": "Boho Queen", "price": 179, "topColor": "#1a0535", "bottomColor": "#1c0a28", "bottomStyle": "skirt", "accent": "#f472b6", "tag": "Boho",   "category": "outfits"},
        {"id": "o5", "name": "Denim Days", "price": 170, "topColor": "#0c1d3b", "bottomColor": "#1e3a5f", "bottomStyle": "pants", "accent": "#60a5fa", "tag": "Casual", "category": "outfits"},
    ],
}

ALL_ITEMS = [item for items in CATALOG.values() for item in items]

# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Aura Virtual Try-On API v2 is running.", "status": "ok"}

@app.get("/catalog")
def get_catalog(category: Optional[str] = Query(None)):
    if category and category in CATALOG:
        return {category: CATALOG[category]}
    return CATALOG

@app.get("/catalog/{category}")
def get_category(category: str):
    if category not in CATALOG:
        return {"error": f"Category '{category}' not found", "available": list(CATALOG.keys())}
    return {"category": category, "items": CATALOG[category], "count": len(CATALOG[category])}

@app.get("/item/{item_id}")
def get_item(item_id: str):
    for item in ALL_ITEMS:
        if item["id"] == item_id:
            return item
    return {"error": f"Item '{item_id}' not found"}

@app.get("/recommend/{item_id}")
def recommend(item_id: str, count: int = Query(3, ge=1, le=8)):
    target = next((i for i in ALL_ITEMS if i["id"] == item_id), None)
    if not target:
        return {"error": f"Item '{item_id}' not found"}
    tag = target.get("tag")
    cat = target.get("category")
    # Same tag, different category first; then same tag same category
    diff_cat = [i for i in ALL_ITEMS if i["id"] != item_id and i.get("tag") == tag and i.get("category") != cat]
    same_cat = [i for i in ALL_ITEMS if i["id"] != item_id and i.get("tag") == tag and i.get("category") == cat]
    combined = diff_cat + same_cat
    seen = set(); unique = []
    for i in combined:
        if i["id"] not in seen:
            seen.add(i["id"]); unique.append(i)
    return {"item_id": item_id, "recommendations": unique[:count]}

@app.get("/search")
def search(q: str = Query(..., min_length=1)):
    q_lower = q.lower()
    results = [i for i in ALL_ITEMS if q_lower in i["name"].lower() or q_lower in i.get("tag","").lower()]
    return {"query": q, "results": results, "count": len(results)}

@app.get("/health")
def health():
    return {"status": "healthy", "items_total": len(ALL_ITEMS)}
