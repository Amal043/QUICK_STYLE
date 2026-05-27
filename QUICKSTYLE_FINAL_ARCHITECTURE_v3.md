# ⚡ QUICKSTYLE — FINAL ARCHITECTURE v3.0
## The Complete, Updated, Judge-Winning Blueprint
### Google Cloud Rapid AI Agent Hackathon

> **What changed from v2:** Agent Negotiation system, Voice Input, Outfit Completion Agent, Hyperlocal Trend Intelligence, Fit Confidence badges, Proactive Reorder Agent, Live Delivery Tracking with Google Maps + real-time partner movement, Smart Routing with highlighted path, 360° viewer via video frame extraction (24 frames WebP), and full implementation details for every single addition.

---

## TABLE OF CONTENTS

1. [Vision & Demo Strategy](#1-vision--demo-strategy)
2. [What Changed from v2 — and Why](#2-what-changed-from-v2)
3. [Final Tech Stack — Every Dependency](#3-final-tech-stack)
4. [System Architecture Diagram](#4-system-architecture)
5. [Complete File & Directory Structure](#5-file-structure)
6. [Database Design — Every Collection & Schema](#6-database-design)
7. [AI Agent System — All Agents Including New Ones](#7-ai-agent-system)
8. [Agent Negotiation System — The Multi-Agent Argument](#8-agent-negotiation)
9. [Voice Input Integration](#9-voice-input)
10. [Outfit Completion Agent](#10-outfit-completion-agent)
11. [Hyperlocal Trend Intelligence](#11-hyperlocal-trend-intelligence)
12. [Fit Confidence Badge System](#12-fit-confidence-badges)
13. [Proactive Reorder Agent](#13-proactive-reorder-agent)
14. [Live Delivery Tracking — Google Maps + Real-Time Partner Movement](#14-live-delivery-tracking)
15. [Smart Routing — Highlighted Shortest Path](#15-smart-routing)
16. [360° Product Viewer — Video Frame Extraction Method](#16-360-viewer)
17. [Backend API — Every Endpoint](#17-backend-api)
18. [Frontend — Every Page & Component](#18-frontend)
19. [Real-Time Layer — Redis Pub/Sub + WebSockets](#19-real-time-layer)
20. [Agent Brain Dashboard — Updated with Negotiation Terminal](#20-agent-brain-dashboard)
21. [Self-Healing DevOps Agent](#21-devops-agent)
22. [Synthetic Data Engine](#22-synthetic-data-engine)
23. [Safety & Guardrails](#23-safety-and-guardrails)
24. [Payment Flow](#24-payment-flow)
25. [Environment Variables & Free Credentials](#25-environment-variables)
26. [Docker Compose & Local Setup](#26-docker-compose)
27. [AI Build Instructions — Prompt by Prompt](#27-ai-build-instructions)
28. [Hackathon Video Script — Updated Shot by Shot](#28-hackathon-video-script)

---

## 1. VISION & DEMO STRATEGY

### What QuickStyle Is

A 30-minute quick-commerce fashion delivery platform where an AI agent fleet handles everything — and crucially, the agents **argue with each other** to reach the best decision. The Stylist Agent recommends products. The Anti-Return Agent challenges those recommendations based on your return history. They negotiate. The best product wins. All of this is visible live in the Agent Brain terminal.

Add voice input, live delivery tracking on Google Maps, 360° product views, and a proactive agent that messages you before you even open the app — and you have something no other team at this hackathon will have.

### The 5 Demo Moments Judges Will Remember

**Moment 1 — The Agent Argument (0:45 mark)**
The terminal shows agents disagreeing in real time. Stylist recommends Zara. Anti-Return objects. Stylist reconsiders. Supervisor resolves. Judges film this on their phones.

**Moment 2 — Voice to Purchase (1:00 mark)**
User speaks: "Yellow dress for brunch under 2000 rupees." AI responds with products + personalized style note. No typing. Pure voice-to-commerce.

**Moment 3 — Live Delivery on Google Maps (1:30 mark)**
After checkout, the order status screen shows a real Google Map with a moving delivery partner dot following the highlighted route from store to customer. ETA updates every 3 seconds.

**Moment 4 — Outfit Completion (1:50 mark)**
After buying the dress, the Outfit Agent automatically suggests matching bag and sandals from nearby stores. "Complete the look" — shown inline in chat.

**Moment 5 — Self-Healing DevOps Agent (2:30 mark)**
The showstopper from v2, kept intact. Bug injected. Agent diagnoses. GitLab MR created. Judges click the real link.

---

## 2. WHAT CHANGED FROM V2

| v2 Feature | v3 Status | What Changed |
|---|---|---|
| Static Leaflet map (2 pins) | ❌ Replaced | Google Maps + live moving partner dot + route |
| Sequential agent pipeline | ❌ Replaced | Agent Negotiation system with real disagreement |
| No voice input | ✅ Added | Web Speech API, zero setup, browser-native |
| No outfit suggestions | ✅ Added | Outfit Completion Agent, triggered post-purchase |
| No trend localisation | ✅ Added | Hyperlocal Trend Agent using Tavily |
| Invisible Anti-Return scores | ✅ Made visible | Fit Confidence badge on every product card |
| No proactive agent | ✅ Added | Proactive Reorder Agent via background Celery task |
| 36-frame JPG sequence | ✅ Improved | 24-frame WebP from video (FFmpeg extraction) |
| OpenStreetMap tiles | ❌ Replaced | Google Maps JavaScript API with Directions API |

---

## 3. FINAL TECH STACK

### Frontend
```
React 18 + TypeScript + Vite 5              → Core framework
Tailwind CSS 3.4                             → Utility styling
Shadcn/UI + Radix UI                         → Component library
Framer Motion 11                             → Animations
@react-google-maps/api                       → Google Maps (replaces Leaflet)
@use-gesture/react                           → Touch/drag for 360° viewer
Zustand                                      → Client state
TanStack Query v5                            → Server state + caching
Socket.io-client                             → WebSocket real-time
Recharts                                     → Admin analytics charts
Lottie React                                 → JSON animations
React Hook Form + Zod                        → Form validation
Lucide React                                 → Icons
axios                                        → HTTP client
Web Speech API                               → Voice input (browser-native, no install)
```

### Backend
```
Python 3.11 + FastAPI                        → Primary API server
uvicorn[standard]                            → ASGI server
LangGraph 0.2+                               → Agent state machine + negotiation graph
LangChain 0.3+                               → Agent framework
langchain-google-vertexai                    → Gemini LLM + Embeddings
google-cloud-aiplatform                      → Vertex AI SDK
google-cloud-storage                         → GCS for images + 360° frames
Motor (async PyMongo)                        → Async MongoDB driver
redis[hiredis] + redis.asyncio               → Cache + pub/sub
elasticsearch[async]                         → Product search + vector search
python-jose[cryptography]                    → JWT
passlib[bcrypt]                              → Password hashing
httpx                                        → Async HTTP
Pillow                                       → Image processing
python-multipart                             → File uploads
pydantic v2                                  → Validation
celery + redis                               → Background tasks (Proactive Agent)
celery-beat                                  → Scheduled tasks for Proactive Agent
loguru                                       → Structured logging
python-dotenv                                → Env loading
razorpay                                     → Payments
tavily-python                                → Web search (Trend Agent)
twilio                                       → WhatsApp notifications (Proactive Agent)
ffmpeg-python                                → 360° frame extraction from video
```

### Databases & Infrastructure
```
MongoDB Atlas M0 (free)                      → Primary DB
Upstash Redis (free)                         → Cache + pub/sub + sessions
Elasticsearch 8 on Elastic Cloud            → Product search + kNN
Google Cloud Storage (free 5GB)             → Images + 360° WebP frames
Google Maps JavaScript API (free $200/mo)   → Live tracking map + routing
Google Directions API (free $200/mo)        → Smart route calculation
```

### AI Infrastructure
```
Vertex AI Gemini 1.5 Pro                    → Main reasoning + negotiation
Vertex AI Gemini 1.5 Flash                  → Fast tasks (intent, safety, fit scores)
Vertex AI Gemini 1.5 Pro Vision             → Style analysis (multimodal)
Vertex AI text-embedding-004                → Product embeddings
FAISS (in-memory)                           → RAG knowledge base
Tavily API (free 1000 req/month)            → Hyperlocal trend scraping
Twilio (free trial $15 credit)              → WhatsApp proactive messages
```

---

## 4. SYSTEM ARCHITECTURE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          USER-FACING LAYER                                ║
║  ┌──────────────────────┐   ┌──────────────────────────────────────────┐  ║
║  │  Customer Chat PWA   │   │  Admin / Agent Brain Dashboard           │  ║
║  │  + Voice Input       │   │  (Negotiation Terminal + DevOps Panel)   │  ║
║  │  + Live Map Tracking │   │                                          │  ║
║  └──────────┬───────────┘   └──────────────────┬───────────────────────┘  ║
╚═════════════╪════════════════════════════════════╪══════════════════════════╝
              │  REST + WebSocket                  │  WebSocket (admin)
              ▼                                    ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║              NGINX REVERSE PROXY (Rate limiting + routing)                ║
╚══════════════════════════╦════════════════════════════════════════════════╝
                           ║
         ┌─────────────────┼──────────────────────┐
         ▼                 ▼                       ▼
┌──────────────┐  ┌─────────────────┐   ┌────────────────────┐
│  REST API    │  │  WebSocket API  │   │  Background Tasks  │
│  (FastAPI)   │  │  (Socket.io)    │   │  (Celery + Redis)  │
│              │  │  + Tracking WS  │   │  Proactive Agent   │
└──────┬───────┘  └────────┬────────┘   └────────┬───────────┘
       │                   │                      │
       └───────────────────┼──────────────────────┘
                           ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║           SUPERVISOR AGENT (LangGraph NegotiationGraph)                   ║
║                                                                           ║
║  ┌────────────┐  ┌───────────────┐  ┌──────────┐  ┌──────────────────┐  ║
║  │  Safety    │  │   Intent      │  │Supervisor│  │  DevOps Agent    │  ║
║  │  Agent     │  │   Detector    │  │Negotiator│  │  (self-healing)  │  ║
║  └─────┬──────┘  └───────┬───────┘  └────┬─────┘  └─────────┬────────┘  ║
║        │                 │               │                   │           ║
║   PASS/BLOCK         routes to:    MEDIATES BETWEEN       triggered      ║
║                          │         AGENTS IN CONFLICT    by Dynatrace    ║
║       ┌──────────────────┼──────────────────────────┐                   ║
║       ▼                  ▼                          ▼                   ║
║  ┌──────────┐  ┌──────────────────┐   ┌──────────────────┐              ║
║  │ Stylist  │◄►│  Anti-Return     │   │  Outfit          │              ║
║  │ Agent    │  │  Agent           │   │  Completion      │              ║
║  │ +Vision  │  │  NEGOTIATES ↕    │   │  Agent           │              ║
║  └──────────┘  └──────────────────┘   └──────────────────┘              ║
║       ▲                  ▲                                               ║
║  CONFLICT          CONFLICT RESOLVED                                     ║
║  DETECTED          BY SUPERVISOR                                         ║
║                                                                          ║
║  ┌───────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  ║
║  │ RAG Agent │  │ Payment      │  │ Trend      │  │ Proactive        │  ║
║  │ (FAISS)   │  │ Agent        │  │ Agent      │  │ Reorder Agent    │  ║
║  └───────────┘  └──────────────┘  │ (Tavily)   │  │ (Celery Beat)    │  ║
║                                   └────────────┘  └──────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════╝
         │                    │                      │
┌────────┼───────┐   ┌────────┼──────────┐  ┌───────┼──────────────┐
▼        ▼       ▼   ▼        ▼          ▼  ▼       ▼              ▼
MongoDB  Redis   ES  Vertex   Google     GCS GitLab  Google Maps    Twilio
Atlas    PubSub      AI       Directions     MCP     Directions API WhatsApp
                     Gemini   API                    (Smart Route)
```

---

## 5. FILE STRUCTURE

```
quickstyle/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── nginx/
│   └── nginx.conf
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/
│       │   ├── customer/
│       │   │   ├── Home.tsx                    # Trending + hyperlocal section
│       │   │   ├── Chat.tsx                    # Voice input integrated
│       │   │   ├── ProductDetail.tsx           # 360° viewer + fit badge
│       │   │   ├── Cart.tsx
│       │   │   ├── Checkout.tsx
│       │   │   └── OrderStatus.tsx             # Google Maps live tracking
│       │   ├── shopkeeper/
│       │   │   └── Dashboard.tsx
│       │   └── admin/
│       │       ├── Dashboard.tsx
│       │       ├── AgentBrain.tsx              # Negotiation terminal
│       │       ├── SafetyPanel.tsx
│       │       └── DevOpsPanel.tsx
│       ├── components/
│       │   ├── ui/
│       │   ├── product/
│       │   │   ├── Product360Viewer.tsx        # 24-frame WebP drag viewer
│       │   │   ├── ProductImageGallery.tsx
│       │   │   ├── ProductCard.tsx             # Now includes FitBadge
│       │   │   ├── FitConfidenceBadge.tsx      # NEW — green/yellow/red score
│       │   │   ├── OutfitCompletionCard.tsx    # NEW — complete the look
│       │   │   ├── TrendingBanner.tsx          # Updated with hyperlocal data
│       │   │   └── SeasonalHero.tsx
│       │   ├── chat/
│       │   │   ├── ChatWindow.tsx
│       │   │   ├── ChatMessage.tsx
│       │   │   ├── ProductSuggestionCard.tsx
│       │   │   ├── StyleNoteCard.tsx
│       │   │   ├── AgentStatusBar.tsx          # Updated with negotiation states
│       │   │   ├── NegotiationCard.tsx         # NEW — shows agent argument
│       │   │   ├── VoiceInputButton.tsx        # NEW — microphone button
│       │   │   └── TypingIndicator.tsx
│       │   ├── map/
│       │   │   ├── LiveTrackingMap.tsx         # NEW — Google Maps live tracking
│       │   │   └── RoutePolyline.tsx           # NEW — highlighted route
│       │   ├── admin/
│       │   │   ├── AgentLogTerminal.tsx        # Updated with negotiation events
│       │   │   ├── NegotiationReplayCard.tsx   # NEW — shows past negotiations
│       │   │   ├── AgentCard.tsx
│       │   │   ├── MetricCard.tsx
│       │   │   └── LiveOrderKanban.tsx
│       │   └── layout/
│       │       ├── Navbar.tsx
│       │       ├── BottomNav.tsx
│       │       └── Sidebar.tsx
│       ├── store/
│       │   ├── authStore.ts
│       │   ├── cartStore.ts
│       │   └── chatStore.ts
│       ├── hooks/
│       │   ├── useWebSocket.ts
│       │   ├── useAgentLog.ts
│       │   ├── useGeolocation.ts
│       │   ├── useVoiceInput.ts                # NEW — Web Speech API hook
│       │   └── useDeliveryTracking.ts          # NEW — tracking WebSocket hook
│       ├── lib/
│       │   ├── api.ts
│       │   ├── socket.ts
│       │   ├── googleMaps.ts                   # NEW — Maps loader + config
│       │   └── utils.ts
│       └── types/
│           └── index.ts
│
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   └── app/
│       ├── api/
│       │   └── v1/
│       │       ├── auth.py
│       │       ├── products.py                 # 360° upload + frame processing
│       │       ├── orders.py
│       │       ├── chat.py
│       │       ├── search.py
│       │       ├── admin.py
│       │       ├── payments.py
│       │       ├── tracking.py                 # NEW — live GPS WebSocket
│       │       ├── trends.py                   # NEW — hyperlocal trend endpoint
│       │       └── seed.py
│       ├── agents/
│       │   ├── supervisor.py                   # Updated NegotiationGraph
│       │   ├── safety_agent.py
│       │   ├── intent_detector.py
│       │   ├── stylist_agent.py                # Updated — emits negotiation events
│       │   ├── anti_return_agent.py            # Updated — can reject + negotiate
│       │   ├── negotiation_mediator.py         # NEW — resolves agent conflicts
│       │   ├── outfit_completion_agent.py      # NEW
│       │   ├── trend_agent.py                  # NEW — Tavily hyperlocal
│       │   ├── proactive_reorder_agent.py      # NEW — Celery background task
│       │   ├── stock_agent.py
│       │   ├── rag_agent.py
│       │   ├── payment_agent.py
│       │   ├── devops_agent.py
│       │   ├── synthetic_data_agent.py
│       │   └── tools/
│       │       ├── elastic_tools.py
│       │       ├── mongo_tools.py
│       │       ├── vision_tools.py
│       │       ├── web_search_tools.py         # Tavily
│       │       ├── payment_tools.py
│       │       ├── gitlab_tools.py
│       │       ├── rag_tools.py
│       │       ├── routing_tools.py            # NEW — Google Directions API
│       │       ├── notification_tools.py       # NEW — Twilio WhatsApp
│       │       └── frame_tools.py              # NEW — FFmpeg frame extraction
│       ├── models/
│       │   ├── user.py
│       │   ├── product.py
│       │   ├── order.py
│       │   ├── chat.py
│       │   └── negotiation.py                  # NEW — negotiation event model
│       ├── db/
│       │   ├── mongodb.py
│       │   ├── redis_client.py
│       │   └── elasticsearch_client.py
│       ├── middleware/
│       │   ├── auth_middleware.py
│       │   ├── rate_limiter.py
│       │   └── safety_filter.py
│       ├── websocket/
│       │   ├── connection_manager.py           # Updated with tracking connections
│       │   └── agent_broadcaster.py            # Updated with negotiation events
│       ├── celery_app.py                       # Celery config + Proactive tasks
│       └── services/
│           ├── routing_service.py              # Google Directions wrapper
│           ├── tracking_service.py             # GPS simulation service
│           └── frame_extraction_service.py     # FFmpeg 360° processing
│
├── scripts/
│   ├── seed_products.py
│   ├── build_faiss_index.py
│   ├── index_products_elastic.py
│   ├── inject_bug.py
│   └── test_full_flow.py
│
└── knowledge_base/
    ├── sizing_guide.txt
    ├── brand_profiles.txt
    ├── delivery_faq.txt
    └── return_policy.txt
```

---

## 6. DATABASE DESIGN

### Collection: `users`
```javascript
{
  _id: ObjectId,
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "+919876543210",
  password_hash: "$2b$12$...",
  role: "customer",

  profile_photo_url: "https://storage.googleapis.com/quickstyle/users/abc/photo.jpg",

  addresses: [{
    label: "Home",
    street: "45 Lake Road",
    area: "Salt Lake",
    city: "Kolkata",
    pincode: "700064",
    location: { lat: 22.5726, lon: 88.4322 },
    is_default: true
  }],

  size_profile: {
    tops: "M",
    bottoms: "M",
    footwear: "7",
    height_cm: 162,
    weight_kg: 58
  },

  return_history: [{
    product_id: ObjectId,
    brand: "Zara",
    category: "tops",
    size_bought: "M",
    reason: "poor_fit",
    fit_issue: "runs_small",
    date: ISODate("2024-09-15")
  }],

  // NEW: purchase history for Proactive Reorder Agent
  purchase_history: [{
    product_id: ObjectId,
    category: "women_ethnic",
    subcategory: "kurta",
    brand: "Biba",
    purchased_at: ISODate("2025-02-15"),
    season: "festive"
  }],

  // NEW: notification preferences
  notification_prefs: {
    whatsapp_enabled: true,
    proactive_suggestions: true,
    last_notified_at: ISODate
  },

  payment_preauth: {
    limit_rupees: 3000,
    used_rupees: 0,
    expires_at: ISODate,
    razorpay_token: "tok_xxx"
  },

  created_at: ISODate,
  last_active: ISODate
}
```

### Collection: `products`
```javascript
{
  _id: ObjectId,
  name: "Yellow Floral Wrap Dress",
  description: "Lightweight cotton wrap dress...",
  brand: "Fabindia",
  size_variance: 1,
  size_note: "This brand runs large — consider sizing down",
  category: "women_clothing",
  subcategory: "dresses",

  tags: ["yellow", "floral", "wrap", "summer", "cotton", "brunch", "boho"],

  // NEW: outfit pairing tags for Outfit Completion Agent
  outfit_tags: ["floral", "bohemian", "summer_casual"],
  pairs_well_with: ["woven_bag", "block_heel_sandal", "straw_hat"],

  price: {
    mrp: 2499,
    selling_price: 1899,
    discount_percent: 24
  },

  sizes_available: ["XS", "S", "M", "L", "XL"],

  colors: [{
    name: "Yellow Floral",
    hex: "#FFD700",
    images: {
      main: "https://storage.googleapis.com/.../main.webp",
      gallery: [
        "https://storage.googleapis.com/.../front.webp",
        "https://storage.googleapis.com/.../back.webp",
        "https://storage.googleapis.com/.../side.webp"
      ],
      // NEW: 24 WebP frames instead of 36 JPGs
      frames_360: [
        "https://storage.googleapis.com/.../360/00.webp",
        "https://storage.googleapis.com/.../360/01.webp",
        // ... 24 total, 15° apart
      ],
      has_360: true
    }
  }],

  store_id: ObjectId,
  store_location: { lat: 22.5726, lon: 88.4018 },
  store_name: "Fabindia South City",

  stock: { "XS": 3, "S": 5, "M": 2, "L": 8, "XL": 4 },

  embedding: [0.023, -0.187, 0.445, ...],  // 768 dimensions

  rating: { average: 4.3, count: 127 },

  // NEW: fit_confidence_avg pre-computed across all buyers
  fit_confidence_avg: 78,

  active: true,
  created_at: ISODate
}
```

### Collection: `orders`
```javascript
{
  _id: ObjectId,
  order_number: "QS20241234",
  customer_id: ObjectId,
  store_id: ObjectId,

  items: [{
    product_id: ObjectId,
    name: "Yellow Floral Wrap Dress",
    brand: "Fabindia",
    size: "M",
    color: "Yellow Floral",
    quantity: 1,
    price: 1899,
    image_url: "..."
  }],

  pricing: {
    subtotal: 1899,
    delivery_fee: 49,
    total: 1948
  },

  delivery_address: {
    street: "45 Lake Road",
    area: "Salt Lake",
    city: "Kolkata",
    pincode: "700064",
    location: { lat: 22.5726, lon: 88.4322 }
  },

  // NEW: delivery partner for live tracking
  delivery_partner: {
    name: "Rahul Kumar",
    phone: "+919876543210",
    vehicle: "bike",
    photo_url: "https://storage.googleapis.com/.../rahul.jpg",
    current_location: { lat: 22.5726, lon: 88.4018 },
    last_location_update: ISODate
  },

  // NEW: Google Directions route for smart routing
  route: {
    polyline_encoded: "abc123encoded...",   // Google encoded polyline
    distance_km: 3.2,
    duration_minutes: 18,
    steps: [...]                            // turn-by-turn steps
  },

  status: "out_for_delivery",
  timeline: [{
    status: "placed",
    timestamp: ISODate,
    note: "Order placed via AI chat"
  }],

  payment: {
    method: "razorpay_upi",
    status: "paid",
    razorpay_order_id: "order_xxx"
  },

  ai_metadata: {
    chat_session_id: "sess_abc",
    stylist_confidence: 0.92,
    fit_score: 78,
    style_note: "The yellow complements your warm skin tone...",
    // NEW: negotiation metadata
    negotiation_occurred: true,
    negotiation_rounds: 2,
    original_recommendation: "Zara Yellow Dress",
    final_recommendation: "Fabindia Yellow Dress",
    negotiation_reason: "User returned Zara M twice"
  },

  created_at: ISODate,
  estimated_delivery: ISODate
}
```

### Collection: `negotiation_logs`
```javascript
// NEW COLLECTION — stores every agent argument for admin terminal replay
{
  _id: ObjectId,
  session_id: "sess_abc",
  user_id: ObjectId,
  triggered_at: ISODate,

  rounds: [{
    round: 1,
    stylist_recommendation: {
      product_id: ObjectId,
      product_name: "Zara Yellow Midi Dress",
      confidence: 0.89,
      reasoning: "Strong semantic match for occasion, color, budget"
    },
    anti_return_objection: {
      triggered: true,
      confidence_penalty: -0.48,
      adjusted_confidence: 0.41,
      evidence: [
        "User returned Zara size M on 2024-09-15 (runs_small)",
        "User returned Zara size M on 2024-07-02 (runs_small)"
      ],
      recommendation: "Avoid Zara for this user"
    },
    resolution: "stylist_reconsidered"
  }, {
    round: 2,
    stylist_recommendation: {
      product_id: ObjectId,
      product_name: "H&M Yellow Wrap Dress",
      confidence: 0.84,
      reasoning: "H&M true-to-size, no return history"
    },
    anti_return_objection: {
      triggered: false,
      confidence_penalty: 0,
      adjusted_confidence: 0.84
    },
    resolution: "approved"
  }],

  outcome: {
    final_product_id: ObjectId,
    final_product_name: "H&M Yellow Wrap Dress",
    final_confidence: 0.84,
    total_rounds: 2,
    total_ms: 820
  }
}
```

### Collection: `trends`
```javascript
// NEW COLLECTION — cached hyperlocal trend data
{
  _id: ObjectId,
  area: "Salt Lake",
  city: "Kolkata",
  fetched_at: ISODate,
  expires_at: ISODate,  // TTL 2 hours

  trending_items: [{
    keyword: "handloom saree",
    heat_score: 94,
    source: "tavily_instagram_scrape",
    context: "Trending in Salt Lake for upcoming Durga Puja"
  }, {
    keyword: "linen coord set",
    heat_score: 87,
    source: "tavily_twitter_scrape",
    context: "Popular for summer office wear in Kolkata"
  }],

  raw_tavily_results: [...]
}
```

### Redis Key Structure
```
# Authentication
session:{user_id}                    → JWT payload (TTL 86400s)
otp:{phone}                          → 6-digit OTP (TTL 300s)

# Inventory
inventory_lock:{product_id}:{size}   → reservation count (TTL 600s)
stock_snapshot:{store_id}            → full stock JSON (TTL 300s)

# Real-time pub/sub
channel:orders:{user_id}             → order status updates
channel:admin                        → admin dashboard events
channel:agents                       → agent brain terminal logs
channel:devops                       → DevOps agent events
channel:negotiation                  → NEW: negotiation events for terminal
channel:tracking:{order_id}          → NEW: GPS coordinate updates

# Rate limiting
ratelimit:{ip}:{endpoint}            → request count (TTL 60s)

# Trends cache
trending:{area}                      → hyperlocal trend JSON (TTL 7200s)

# Proactive agent
proactive:last_run:{user_id}         → timestamp (TTL 86400s × 7)
proactive:notified:{user_id}:{cat}   → flag to avoid spam (TTL 604800s)

# Tracking simulation
tracking:route:{order_id}            → encoded route polyline
tracking:step:{order_id}             → current step index integer
tracking:partner:{order_id}          → {lat, lon, bearing, eta} JSON

# DevOps
injected_bug_active                  → boolean flag
```

---

## 7. AI AGENT SYSTEM

### Complete Agent Inventory

| Agent | Role | New in v3 |
|---|---|---|
| Safety Agent | Content + injection check | No |
| Intent Detector | Parse user intent + entities | No |
| Stylist Agent | ES search + Gemini Vision | Updated — emits negotiation events |
| Anti-Return Agent | Fit prediction + objections | Updated — can formally OBJECT |
| Negotiation Mediator | Resolves Stylist vs Anti-Return conflicts | **NEW** |
| Outfit Completion Agent | Post-purchase pairing suggestions | **NEW** |
| Trend Agent | Tavily hyperlocal trend scraping | **NEW** |
| Proactive Reorder Agent | Background Celery task, WhatsApp push | **NEW** |
| Stock Agent | Redis inventory check | No |
| RAG Agent | FAISS knowledge base Q&A | No |
| Payment Agent | Razorpay execution | No |
| DevOps Agent | Self-healing GitLab MR | No |
| Synthetic Data Agent | Database seeder | No |

---

## 8. AGENT NEGOTIATION SYSTEM

### The Core Innovation — Real Multi-Agent Conflict

This is what transforms your sequential pipeline into genuine multi-agent AI. The Stylist Agent and Anti-Return Agent have opposing goals. The Supervisor now mediates.

```python
# backend/app/agents/supervisor.py
"""
Updated NegotiationGraph — replaces the simple sequential pipeline.
Agents can now object to each other's decisions. The Supervisor mediates.
Max 3 negotiation rounds before Supervisor forces a decision.
"""

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence, Optional, List
import operator, json, asyncio, time

class AgentState(TypedDict):
    messages: Annotated[Sequence[dict], operator.add]
    session_id: str
    user_id: str
    user_location: Optional[dict]
    user_profile: Optional[dict]
    user_photo_url: Optional[str]

    intent: str
    extracted_entities: dict

    # Negotiation state — NEW
    negotiation_round: int                    # current round (max 3)
    stylist_proposal: Optional[dict]          # current recommendation
    anti_return_verdict: Optional[dict]       # objection or approval
    negotiation_history: Annotated[list, operator.add]  # all rounds
    negotiation_complete: bool

    raw_search_results: list
    filtered_products: list
    style_note: Optional[str]
    fit_assessments: list
    stock_verified_products: list
    reservations_made: list
    payment_status: Optional[str]
    order_id: Optional[str]
    rag_answer: Optional[str]
    outfit_suggestions: Optional[list]        # NEW
    trend_context: Optional[str]              # NEW

    safety_passed: bool
    error: Optional[str]
    final_response: Optional[str]
    agent_log: Annotated[list, operator.add]
```

```python
# backend/app/agents/negotiation_mediator.py
"""
The Negotiation Mediator runs BETWEEN Stylist and Anti-Return agents.
It decides: keep negotiating, force a decision, or accept the proposal.
"""

from langchain_google_vertexai import ChatVertexAI
from app.websocket.agent_broadcaster import broadcast_agent_event
import time, json

MAX_NEGOTIATION_ROUNDS = 3
CONFIDENCE_FLOOR = 0.35   # below this, reject no matter what

async def negotiation_mediator_node(state: dict) -> dict:
    """
    Called after every Anti-Return verdict.
    Decides whether negotiation continues or is resolved.
    """
    session_id = state["session_id"]
    round_num = state.get("negotiation_round", 1)
    proposal = state.get("stylist_proposal", {})
    verdict = state.get("anti_return_verdict", {})
    history = state.get("negotiation_history", [])

    start_ms = time.time()

    # Case 1: Anti-Return approved the recommendation
    if not verdict.get("objection_raised"):
        await broadcast_negotiation_event(session_id, {
            "type": "negotiation_resolved",
            "round": round_num,
            "resolution": "approved",
            "message": f"✅ Supervisor → Approved: {proposal.get('product_name')} (confidence: {proposal.get('confidence', 0):.0%})",
            "final_product": proposal.get("product_name"),
            "final_confidence": proposal.get("confidence")
        })
        return {
            "negotiation_complete": True,
            "negotiation_history": [{"round": round_num, "resolution": "approved", "proposal": proposal, "verdict": verdict}],
            "agent_log": [{"agent": "negotiation_mediator", "action": "approved", "round": round_num}]
        }

    # Case 2: Objection raised but max rounds not hit — ask Stylist to reconsider
    if round_num < MAX_NEGOTIATION_ROUNDS:
        await broadcast_negotiation_event(session_id, {
            "type": "negotiation_conflict",
            "round": round_num,
            "message": f"⚠️ Supervisor → Conflict detected. Asking Stylist Agent to reconsider...",
            "stylist_confidence": proposal.get("confidence"),
            "anti_return_penalty": verdict.get("confidence_penalty"),
            "adjusted_confidence": verdict.get("adjusted_confidence"),
            "evidence": verdict.get("evidence", [])
        })
        return {
            "negotiation_complete": False,
            "negotiation_round": round_num + 1,
            "negotiation_history": [{"round": round_num, "resolution": "conflict", "proposal": proposal, "verdict": verdict}],
            "agent_log": [{"agent": "negotiation_mediator", "action": "conflict_round", "round": round_num}]
        }

    # Case 3: Max rounds hit — Supervisor forces decision based on adjusted confidence
    llm = ChatVertexAI(model_name="gemini-1.5-flash", temperature=0)
    force_prompt = f"""You are the Supervisor Agent mediating a conflict.

Negotiation history (last {len(history)} rounds):
{json.dumps(history, indent=2)}

Current proposal:
- Product: {proposal.get('product_name')}
- Stylist confidence: {proposal.get('confidence')}
- Adjusted after Anti-Return penalty: {verdict.get('adjusted_confidence')}
- Anti-Return evidence: {verdict.get('evidence')}

Should we:
A) Accept this product with a warning to the user about fit risk
B) Tell the user no suitable product was found and ask for different criteria

Respond with JSON: {{"decision": "accept" or "reject", "user_message": "brief message to show user"}}"""

    response = llm.invoke(force_prompt)
    try:
        decision_data = json.loads(response.content)
    except Exception:
        decision_data = {"decision": "accept", "user_message": "Found a match — note there may be a slight fit risk."}

    await broadcast_negotiation_event(session_id, {
        "type": "negotiation_forced",
        "round": round_num,
        "message": f"🔨 Supervisor → Max rounds reached. Forcing decision: {decision_data['decision'].upper()}",
        "decision": decision_data["decision"]
    })

    return {
        "negotiation_complete": True,
        "negotiation_history": [{"round": round_num, "resolution": f"forced_{decision_data['decision']}", "proposal": proposal, "verdict": verdict}],
        "agent_log": [{"agent": "negotiation_mediator", "action": f"forced_{decision_data['decision']}", "round": round_num}]
    }


async def broadcast_negotiation_event(session_id: str, event: dict):
    """Publishes negotiation events to the agent terminal AND customer chat."""
    from app.db.redis_client import publish
    enriched = {**event, "session_id": session_id, "timestamp": time.time()}
    await publish("channel:negotiation", enriched)
    await publish("channel:agents", enriched)
```

```python
# backend/app/agents/stylist_agent.py  (updated negotiation-aware)
"""
Updated Stylist Agent — now understands it can be rejected and must reconsider.
On round > 1, it receives the objection evidence and deliberately avoids
the rejected brand/product.
"""

from langchain_google_vertexai import ChatVertexAI
from app.agents.tools.elastic_tools import hybrid_search
from app.agents.tools.vision_tools import analyze_style_with_vision
from app.websocket.agent_broadcaster import broadcast_agent_event
import time, json

async def stylist_node(state: dict) -> dict:
    session_id = state["session_id"]
    round_num = state.get("negotiation_round", 1)
    entities = state.get("extracted_entities", {})
    history = state.get("negotiation_history", [])

    start_ms = time.time()

    # Build exclusion list from past negotiation rounds
    excluded_brands = []
    excluded_products = []
    for past_round in history:
        if past_round.get("resolution") == "conflict":
            rejected = past_round.get("proposal", {})
            excluded_brands.append(rejected.get("brand", ""))
            excluded_products.append(rejected.get("product_id", ""))

    await broadcast_agent_event(session_id, {
        "agent": "stylist_agent",
        "action": "elasticsearch_search",
        "status": "running",
        "details": {
            "round": round_num,
            "excluded_brands": excluded_brands,
            "query": entities
        }
    })

    # Search — exclude rejected brands in filter
    results = await hybrid_search(
        query=entities.get("raw_query", ""),
        location=state.get("user_location"),
        filters={
            "size": entities.get("size"),
            "max_price": entities.get("budget"),
            "exclude_brands": excluded_brands  # KEY: avoid rejected brands
        },
        top_k=5
    )

    if not results:
        return {
            "stylist_proposal": None,
            "filtered_products": [],
            "agent_log": [{"agent": "stylist", "status": "no_results", "round": round_num}]
        }

    # Pick top result and form the proposal
    top_product = results[0]
    confidence = top_product.get("_score", 0.75)

    # Gemini Vision style note (only on round 1 to save latency)
    style_note = None
    if round_num == 1 and state.get("user_photo_url"):
        style_note = await analyze_style_with_vision(
            user_photo_url=state["user_photo_url"],
            product_image_url=top_product.get("images", {}).get("main", ""),
            occasion=entities.get("occasion", ""),
            session_id=session_id
        )

    proposal = {
        "product_id": str(top_product["_id"]),
        "product_name": top_product["name"],
        "brand": top_product["brand"],
        "confidence": confidence,
        "reasoning": f"Strong semantic match for {entities.get('occasion', 'occasion')}, {entities.get('color', '')}, under ₹{entities.get('budget', 'budget')}",
        "product_data": top_product
    }

    await broadcast_agent_event(session_id, {
        "agent": "stylist_agent",
        "action": "proposal_ready",
        "status": "complete",
        "details": {
            "round": round_num,
            "product": top_product["name"],
            "brand": top_product["brand"],
            "confidence": f"{confidence:.0%}"
        },
        "duration_ms": int((time.time() - start_ms) * 1000),
        # NEW: emit the pretty negotiation line for the terminal
        "negotiation_line": f"👗 Stylist Agent → Recommending: {top_product['name']} (confidence: {confidence:.0%})"
    })

    return {
        "stylist_proposal": proposal,
        "filtered_products": results,
        "style_note": style_note,
        "agent_log": [{"agent": "stylist", "proposal": top_product["name"], "round": round_num}]
    }
```

```python
# backend/app/agents/anti_return_agent.py  (updated — can formally OBJECT)
"""
Updated Anti-Return Agent.
Now formally raises objections with evidence that the Negotiation Mediator
passes back to the Stylist Agent.
"""

from app.db.mongodb import get_db
from app.websocket.agent_broadcaster import broadcast_agent_event
from bson import ObjectId
import time

CONFIDENCE_PENALTY_PER_RETURN = 0.24   # Each return of same brand penalizes confidence
OBJECTION_THRESHOLD = 0.50             # Below this adjusted confidence → raise objection

async def anti_return_node(state: dict) -> dict:
    session_id = state["session_id"]
    user_id = state["user_id"]
    proposal = state.get("stylist_proposal", {})
    round_num = state.get("negotiation_round", 1)

    if not proposal:
        return {"anti_return_verdict": {"objection_raised": False}, "fit_assessments": []}

    start_ms = time.time()

    await broadcast_agent_event(session_id, {
        "agent": "anti_return_agent",
        "action": "loading_return_history",
        "status": "running",
        "details": {"checking_brand": proposal.get("brand"), "round": round_num}
    })

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"return_history": 1, "size_profile": 1})
    return_history = user.get("return_history", []) if user else []

    proposed_brand = proposal.get("brand", "")
    proposed_product_id = proposal.get("product_id", "")
    original_confidence = proposal.get("confidence", 0.75)

    # Find matching returns for this brand
    matching_returns = [
        r for r in return_history
        if r.get("brand", "").lower() == proposed_brand.lower()
    ]

    # Calculate confidence adjustment
    confidence_penalty = len(matching_returns) * CONFIDENCE_PENALTY_PER_RETURN
    adjusted_confidence = max(0, original_confidence - confidence_penalty)

    objection_raised = adjusted_confidence < OBJECTION_THRESHOLD

    evidence = [
        f"User returned {r['brand']} size {r.get('size_bought', '?')} on {r['date'].strftime('%Y-%m-%d')} ({r.get('fit_issue', 'unknown issue')})"
        for r in matching_returns
    ]

    verdict = {
        "objection_raised": objection_raised,
        "original_confidence": original_confidence,
        "confidence_penalty": confidence_penalty,
        "adjusted_confidence": adjusted_confidence,
        "matching_returns_count": len(matching_returns),
        "evidence": evidence
    }

    # Compose the terminal display line
    if objection_raised:
        negotiation_line = f"📏 Anti-Return Agent → OBJECTION: User returned {proposed_brand} {len(matching_returns)}x. Confidence drops to {adjusted_confidence:.0%}"
    else:
        negotiation_line = f"📏 Anti-Return Agent → APPROVED: No return risk for {proposed_brand} (confidence: {adjusted_confidence:.0%})"

    await broadcast_agent_event(session_id, {
        "agent": "anti_return_agent",
        "action": "verdict_complete",
        "status": "complete" if not objection_raised else "objection",
        "details": {
            "round": round_num,
            "brand": proposed_brand,
            "returns_found": len(matching_returns),
            "objection": objection_raised,
            "adjusted_confidence": f"{adjusted_confidence:.0%}"
        },
        "duration_ms": int((time.time() - start_ms) * 1000),
        "negotiation_line": negotiation_line   # Powers the terminal UI
    })

    return {
        "anti_return_verdict": verdict,
        "fit_assessments": [{
            "product_id": proposed_product_id,
            "fit_score": int(adjusted_confidence * 100),
            "recommendation": "avoid" if objection_raised else "good_fit",
            "evidence": evidence
        }],
        "agent_log": [{"agent": "anti_return", "objection": objection_raised, "round": round_num}]
    }
```

```python
# backend/app/agents/supervisor.py  (NegotiationGraph routing)
"""
Build the LangGraph StateGraph with negotiation loop.
"""

def build_negotiation_graph():
    graph = StateGraph(AgentState)

    # All agent imports
    from app.agents.stylist_agent import stylist_node
    from app.agents.anti_return_agent import anti_return_node
    from app.agents.negotiation_mediator import negotiation_mediator_node
    from app.agents.stock_agent import stock_node
    from app.agents.rag_agent import rag_node
    from app.agents.payment_agent import payment_node
    from app.agents.outfit_completion_agent import outfit_node
    from app.agents.trend_agent import trend_node

    # Register nodes
    graph.add_node("safety_check", safety_check_node)
    graph.add_node("intent_detector", intent_detector_node)
    graph.add_node("stylist_agent", stylist_node)
    graph.add_node("anti_return_agent", anti_return_node)
    graph.add_node("negotiation_mediator", negotiation_mediator_node)  # NEW
    graph.add_node("stock_agent", stock_node)
    graph.add_node("outfit_agent", outfit_node)                        # NEW
    graph.add_node("trend_agent", trend_node)                          # NEW
    graph.add_node("rag_agent", rag_node)
    graph.add_node("payment_agent", payment_node)
    graph.add_node("response_composer", response_composer_node)

    graph.set_entry_point("safety_check")
    graph.add_edge("safety_check", "intent_detector")

    # Route after intent
    graph.add_conditional_edges(
        "intent_detector",
        route_after_intent,
        {
            "product_search": "stylist_agent",
            "payment": "payment_agent",
            "general_query": "rag_agent",
            "trend_query": "trend_agent",
            "blocked": END
        }
    )

    # THE NEGOTIATION LOOP — this is the key new pattern
    graph.add_edge("stylist_agent", "anti_return_agent")
    graph.add_edge("anti_return_agent", "negotiation_mediator")

    # Conditional edge from mediator: loop back to stylist OR proceed
    graph.add_conditional_edges(
        "negotiation_mediator",
        lambda state: "continue" if not state.get("negotiation_complete") else "done",
        {
            "continue": "stylist_agent",   # Loop back for next round
            "done": "stock_agent"          # Proceed to stock check
        }
    )

    graph.add_edge("stock_agent", "outfit_agent")    # NEW: outfit after stock
    graph.add_edge("outfit_agent", "response_composer")
    graph.add_edge("rag_agent", "response_composer")
    graph.add_edge("trend_agent", "response_composer")
    graph.add_edge("payment_agent", "response_composer")
    graph.add_edge("response_composer", END)

    return graph.compile()
```

---

## 9. VOICE INPUT INTEGRATION

### Zero-Setup Browser-Native Voice

```typescript
// frontend/src/hooks/useVoiceInput.ts
/**
 * Uses Web Speech API — built into Chrome, Edge, Safari.
 * Zero installation. Zero API cost. Zero backend needed.
 * Works on mobile browsers too.
 */

import { useState, useCallback, useRef } from "react";

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export const useVoiceInput = (onTranscriptReady: (text: string) => void): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";           // Indian English accent recognition
    recognition.interimResults = true;    // Show words as they're spoken
    recognition.maxAlternatives = 1;
    recognition.continuous = false;       // Stop after one sentence

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        onTranscriptReady(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onTranscriptReady]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening, isSupported, error };
};
```

```tsx
// frontend/src/components/chat/VoiceInputButton.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Props {
  onTranscriptReady: (text: string) => void;
}

export const VoiceInputButton: React.FC<Props> = ({ onTranscriptReady }) => {
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput(onTranscriptReady);

  if (!isSupported) return null;

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? stopListening : startListening}
        className={`p-2.5 rounded-xl transition-colors ${
          isListening
            ? "bg-red-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
        }`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </motion.button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 right-0 bg-white border border-red-200 rounded-xl p-3 shadow-lg w-56"
          >
            <div className="flex items-center gap-2 mb-1">
              {/* Animated bars — classic voice indicator */}
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-red-500 rounded-full"
                  animate={{ height: [8, 20, 8] }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
              <span className="text-xs text-red-500 font-medium ml-1">Listening...</span>
            </div>
            {transcript && (
              <p className="text-xs text-gray-600 italic truncate">"{transcript}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

```tsx
// In Chat.tsx — add VoiceInputButton next to the send button
// Replace the input area section with:

<div className="bg-white border-t p-3 flex gap-2 items-end">
  <textarea
    value={input}
    onChange={e => setInput(e.target.value)}
    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
    placeholder="Ask me to style you... or tap 🎤 to speak"
    className="flex-1 resize-none border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 max-h-24"
    rows={1}
    disabled={isProcessing}
  />

  {/* NEW: Voice input button */}
  <VoiceInputButton
    onTranscriptReady={(text) => {
      setInput(text);          // populate the text box
      sendMessage(text);       // auto-send
    }}
  />

  <button
    onClick={() => sendMessage(input)}
    disabled={isProcessing || !input.trim()}
    className="bg-pink-500 text-white p-2.5 rounded-xl disabled:opacity-50"
  >
    <ArrowUp size={18} />
  </button>
</div>
```

---

## 10. OUTFIT COMPLETION AGENT

### The "Complete the Look" Feature

```python
# backend/app/agents/outfit_completion_agent.py
"""
Triggered automatically after a successful product recommendation.
Finds 2-3 complementary items (bag, shoes, accessory) from nearby stores.
Uses semantic matching on outfit_tags and pairs_well_with fields.
"""

from langchain_google_vertexai import ChatVertexAI
from app.db.mongodb import get_db
from app.agents.tools.elastic_tools import outfit_search
from app.websocket.agent_broadcaster import broadcast_agent_event
import time, json

OUTFIT_COMPLEMENT_CATEGORIES = {
    "dresses": ["bags", "footwear", "jewellery"],
    "tops": ["bottoms", "bags", "footwear"],
    "kurtas": ["bottoms", "dupattas", "footwear"],
    "sarees": ["blouses", "jewellery", "footwear"],
    "jeans": ["tops", "footwear", "bags"]
}

async def outfit_node(state: dict) -> dict:
    session_id = state["session_id"]
    final_products = state.get("stock_verified_products", [])

    if not final_products:
        return {"outfit_suggestions": None}

    primary_product = final_products[0]
    primary_category = primary_product.get("subcategory", "dresses")
    outfit_tags = primary_product.get("outfit_tags", [])
    pairs_well_with = primary_product.get("pairs_well_with", [])
    user_location = state.get("user_location")

    await broadcast_agent_event(session_id, {
        "agent": "outfit_completion_agent",
        "action": "finding_complements",
        "status": "running",
        "details": {
            "primary": primary_product["name"],
            "looking_for": OUTFIT_COMPLEMENT_CATEGORIES.get(primary_category, ["bags", "footwear"])
        }
    })

    start_ms = time.time()

    # Search for complementary items
    complement_categories = OUTFIT_COMPLEMENT_CATEGORIES.get(primary_category, ["bags", "footwear"])
    suggestions = []

    for complement_cat in complement_categories[:2]:  # Max 2 suggestions
        results = await outfit_search(
            style_tags=outfit_tags,
            pairs_with_tags=pairs_well_with,
            category=complement_cat,
            location=user_location,
            max_price=2000,
            top_k=1
        )
        if results:
            suggestions.append({
                "product": results[0],
                "complement_type": complement_cat,
                "reason": f"Pairs well with {primary_product['name']}"
            })

    if suggestions:
        await broadcast_agent_event(session_id, {
            "agent": "outfit_completion_agent",
            "action": "suggestions_ready",
            "status": "complete",
            "details": {
                "suggestions_found": len(suggestions),
                "items": [s["product"]["name"] for s in suggestions]
            },
            "duration_ms": int((time.time() - start_ms) * 1000)
        })

    return {
        "outfit_suggestions": suggestions,
        "agent_log": [{"agent": "outfit_completion", "suggestions": len(suggestions)}]
    }
```

```python
# backend/app/agents/tools/elastic_tools.py  (add outfit_search function)

async def outfit_search(
    style_tags: list,
    pairs_with_tags: list,
    category: str,
    location: dict,
    max_price: float,
    top_k: int = 3
) -> list:
    """
    Searches Elasticsearch for complementary outfit items.
    Uses the pairs_well_with and outfit_tags fields.
    """
    es = get_es_client()

    query = {
        "bool": {
            "must": [
                {"term": {"subcategory": category}},
                {"range": {"price_selling": {"lte": max_price}}},
                {"term": {"active": True}}
            ],
            "should": [
                {"terms": {"outfit_tags": style_tags, "boost": 2}},
                {"terms": {"tags": pairs_with_tags, "boost": 1.5}}
            ],
            "filter": []
        }
    }

    # Geo-filter if location available
    if location:
        query["bool"]["filter"].append({
            "geo_distance": {
                "distance": "5km",
                "store_location": {"lat": location["lat"], "lon": location["lon"]}
            }
        })

    response = await es.search(
        index="products",
        body={"query": query, "size": top_k}
    )

    return [hit["_source"] for hit in response["hits"]["hits"]]
```

```tsx
// frontend/src/components/product/OutfitCompletionCard.tsx
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface OutfitSuggestion {
  product: any;
  complement_type: string;
  reason: string;
}

export const OutfitCompletionCard: React.FC<{ suggestions: OutfitSuggestion[] }> = ({ suggestions }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 mt-3"
  >
    <div className="flex items-center gap-2 mb-3">
      <Sparkles size={16} className="text-purple-500" />
      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
        Complete the Look
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {suggestions.map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-3 cursor-pointer shadow-sm border border-purple-100"
        >
          <img
            src={s.product.images?.main}
            alt={s.product.name}
            className="w-full h-28 object-cover rounded-lg mb-2"
          />
          <p className="text-xs font-medium text-gray-800 line-clamp-2">{s.product.name}</p>
          <p className="text-xs text-purple-600 font-semibold mt-1">
            ₹{s.product.price?.selling_price}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{s.reason}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);
```

---

## 11. HYPERLOCAL TREND INTELLIGENCE

### Tavily-Powered "Trending in Salt Lake This Week"

```python
# backend/app/agents/trend_agent.py
"""
Uses Tavily to scrape real-time fashion trends specific to Kolkata areas.
Results cached in Redis for 2 hours to avoid hitting Tavily rate limits.
"""

from tavily import TavilyClient
from app.db.redis_client import redis_client
from app.websocket.agent_broadcaster import broadcast_agent_event
import json, time, os
from datetime import datetime

tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

async def trend_node(state: dict) -> dict:
    """Called when intent = trend_query, or as enrichment context for product search."""
    session_id = state["session_id"]
    user_location = state.get("user_location", {})
    area = state.get("extracted_entities", {}).get("area", "Kolkata")

    await broadcast_agent_event(session_id, {
        "agent": "trend_agent",
        "action": "fetching_hyperlocal_trends",
        "status": "running",
        "details": {"area": area}
    })

    start_ms = time.time()

    # Check Redis cache first
    cache_key = f"trending:{area.lower().replace(' ', '_')}"
    cached = await redis_client.get(cache_key)

    if cached:
        trend_data = json.loads(cached)
        trend_context = format_trend_context(trend_data, area)
        return {
            "trend_context": trend_context,
            "agent_log": [{"agent": "trend", "source": "cache", "area": area}]
        }

    # Fetch from Tavily
    search_query = f"fashion trends {area} Kolkata 2025 what to wear"
    results = tavily.search(
        query=search_query,
        search_depth="basic",
        max_results=5,
        include_answer=True
    )

    # Parse and structure results
    trend_items = []
    for r in results.get("results", []):
        trend_items.append({
            "title": r.get("title", ""),
            "snippet": r.get("content", "")[:200],
            "url": r.get("url", ""),
            "heat_score": int(r.get("score", 0.5) * 100)
        })

    trend_data = {
        "area": area,
        "fetched_at": datetime.now().isoformat(),
        "answer": results.get("answer", ""),
        "items": trend_items
    }

    # Cache for 2 hours
    await redis_client.setex(cache_key, 7200, json.dumps(trend_data))

    trend_context = format_trend_context(trend_data, area)

    await broadcast_agent_event(session_id, {
        "agent": "trend_agent",
        "action": "trends_fetched",
        "status": "complete",
        "details": {"area": area, "items_found": len(trend_items), "source": "tavily"},
        "duration_ms": int((time.time() - start_ms) * 1000)
    })

    return {
        "trend_context": trend_context,
        "agent_log": [{"agent": "trend", "source": "tavily", "area": area, "items": len(trend_items)}]
    }


def format_trend_context(trend_data: dict, area: str) -> str:
    items = trend_data.get("items", [])
    if not items:
        return f"Trending in {area}: floral prints, linen sets, ethnic fusion wear"

    top_items = sorted(items, key=lambda x: x.get("heat_score", 0), reverse=True)[:3]
    formatted = ", ".join([item["title"].split(" - ")[0] for item in top_items])
    return f"Trending in {area} right now: {formatted}"
```

```python
# backend/app/api/v1/trends.py
"""
REST endpoint for the frontend to fetch hyperlocal trends.
Used by the Home page Trending section.
"""

from fastapi import APIRouter, Query
from app.agents.trend_agent import trend_node
from app.db.redis_client import redis_client
import json

router = APIRouter()

@router.get("/trends")
async def get_hyperlocal_trends(
    area: str = Query(default="Salt Lake", description="Kolkata area name"),
    city: str = Query(default="Kolkata")
):
    """
    Returns trending fashion items for a specific Kolkata area.
    Cached for 2 hours. Used by Home page and chat enrichment.
    """
    cache_key = f"trending:{area.lower().replace(' ', '_')}"
    cached = await redis_client.get(cache_key)

    if cached:
        return {"source": "cache", "data": json.loads(cached)}

    # Trigger fresh fetch
    result = await trend_node({
        "session_id": "trend_api",
        "user_location": None,
        "extracted_entities": {"area": area}
    })

    return {
        "source": "fresh",
        "area": area,
        "trend_context": result.get("trend_context", "")
    }
```

```tsx
// frontend/src/components/product/TrendingBanner.tsx  (updated with hyperlocal)
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TrendingUp, MapPin } from "lucide-react";

export const HyperlocalTrendingSection = () => {
  const { area } = useGeolocation();  // Returns "Salt Lake", "Park Street", etc.

  const { data: trends } = useQuery({
    queryKey: ["trends", area],
    queryFn: () => api.get(`/trends?area=${area}`).then(r => r.data),
    staleTime: 1000 * 60 * 60 * 2,  // 2 hours
    enabled: !!area
  });

  if (!trends) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 my-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-orange-500" />
          <span className="text-xs text-orange-600 font-semibold">{area}</span>
        </div>
        <TrendingUp size={14} className="text-orange-500 ml-1" />
        <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
          Trending This Week
        </span>
      </div>
      <p className="text-sm text-orange-900">{trends.trend_context}</p>
      <button
        className="mt-2 text-xs text-orange-600 font-medium"
        onClick={() => {/* trigger chat with trend query */}}
      >
        Show me these styles →
      </button>
    </div>
  );
};
```

---

## 12. FIT CONFIDENCE BADGES

### Visible AI — Green, Yellow, Red on Every Card

```python
# backend/app/agents/anti_return_agent.py  (add compute_fit_badge function)

def compute_fit_badge(fit_score: int) -> dict:
    """
    Converts numerical fit score to a badge config.
    fit_score: 0-100
    """
    if fit_score >= 85:
        return {
            "color": "green",
            "label": f"{fit_score}% Fit",
            "detail": "Great fit based on your history",
            "bg_class": "bg-green-100 text-green-700 border-green-200"
        }
    elif fit_score >= 60:
        return {
            "color": "yellow",
            "label": f"{fit_score}% Fit",
            "detail": "Check sizing notes before ordering",
            "bg_class": "bg-yellow-100 text-yellow-700 border-yellow-200"
        }
    else:
        return {
            "color": "red",
            "label": f"{fit_score}% Fit",
            "detail": "High return risk — consider different size or brand",
            "bg_class": "bg-red-100 text-red-700 border-red-200"
        }
```

```tsx
// frontend/src/components/product/FitConfidenceBadge.tsx
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  score: number;
  showDetail?: boolean;
}

export const FitConfidenceBadge: React.FC<Props> = ({ score, showDetail = false }) => {
  const config = score >= 85
    ? { label: `${score}% Fit`, detail: "Great fit for you", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: ShieldCheck }
    : score >= 60
    ? { label: `${score}% Fit`, detail: "Check sizing notes", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: AlertTriangle }
    : { label: `${score}% Fit`, detail: "High return risk", bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: XCircle };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon size={11} />
      <span>{config.label}</span>
      {showDetail && (
        <span className="font-normal opacity-75">· {config.detail}</span>
      )}
    </motion.div>
  );
};
```

```tsx
// In ProductCard.tsx and ProductSuggestionCard.tsx — add badge
// Below the product name, above the price:

<div className="flex items-center justify-between mt-1 mb-2">
  <p className="text-xs text-gray-400">{product.brand}</p>
  {product.fit_score && (
    <FitConfidenceBadge score={product.fit_score} />
  )}
</div>
```

---

## 13. PROACTIVE REORDER AGENT

### The Agent That Acts Without Being Asked

```python
# backend/app/agents/proactive_reorder_agent.py
"""
Runs as a Celery Beat scheduled task — every day at 9 AM IST.
Scans purchase history, detects reorder opportunities, sends WhatsApp.

This is the truest definition of agentic: it acts without being prompted.
No other team at this hackathon will have this.
"""

from celery import shared_task
from langchain_google_vertexai import ChatVertexAI
from app.db.mongodb import get_db
from app.agents.tools.notification_tools import send_whatsapp
from app.agents.tools.elastic_tools import hybrid_search
from app.db.redis_client import redis_client
from datetime import datetime, timedelta
import json, asyncio

SEASONAL_TRIGGERS = {
    # month: [categories that trend that month]
    1:  ["winter_wear", "woollens", "thermals"],
    2:  ["winter_wear", "valentine_gifts"],
    3:  ["summer_wear", "light_fabrics"],
    4:  ["summer_wear", "cottons", "linens"],
    5:  ["summer_wear", "cottons"],
    6:  ["monsoon_wear", "waterproof"],
    7:  ["monsoon_wear"],
    8:  ["monsoon_wear", "independence_day_outfits"],
    9:  ["festive_wear", "ethnic"],        # Durga Puja
    10: ["festive_wear", "ethnic", "sarees"],  # Diwali season
    11: ["festive_wear", "wedding_season"],
    12: ["winter_wear", "christmas_outfits"]
}

@shared_task(name="proactive_reorder_scan")
def proactive_reorder_scan():
    """Celery Beat task — runs daily."""
    asyncio.get_event_loop().run_until_complete(_run_proactive_scan())

async def _run_proactive_scan():
    db = get_db()
    llm = ChatVertexAI(model_name="gemini-1.5-flash", temperature=0.3)

    current_month = datetime.now().month
    trending_categories = SEASONAL_TRIGGERS.get(current_month, [])

    # Get all customers with notifications enabled
    customers = await db.users.find({
        "role": "customer",
        "notification_prefs.whatsapp_enabled": True,
        "notification_prefs.proactive_suggestions": True
    }).to_list(length=500)

    for user in customers:
        try:
            await _process_user_proactive(user, db, llm, trending_categories)
        except Exception as e:
            print(f"Proactive scan error for user {user['_id']}: {e}")
            continue

async def _process_user_proactive(user, db, llm, trending_categories):
    user_id = str(user["_id"])

    # Check if notified recently (don't spam — once per category per week)
    purchase_history = user.get("purchase_history", [])
    if not purchase_history:
        return

    # Find categories the user hasn't bought recently (>60 days)
    stale_categories = []
    for purchase in purchase_history:
        purchased_at = purchase.get("purchased_at")
        if purchased_at and (datetime.now() - purchased_at).days > 60:
            cat = purchase.get("subcategory")
            if cat and cat in trending_categories:
                # Check not already notified for this category this week
                notif_key = f"proactive:notified:{user_id}:{cat}"
                already_notified = await redis_client.get(notif_key)
                if not already_notified:
                    stale_categories.append({
                        "category": cat,
                        "last_purchased": purchased_at,
                        "brand": purchase.get("brand")
                    })

    if not stale_categories:
        return

    # Ask Gemini to write a personalised WhatsApp message
    stale_info = stale_categories[0]  # Take most relevant
    days_since = (datetime.now() - stale_info["last_purchased"]).days

    prompt = f"""Write a short, friendly WhatsApp message for a fashion app.

User info:
- Name: {user.get('name', 'there')}
- Category they last bought: {stale_info['category']}
- Days since last purchase: {days_since}
- Current season/month context: {_get_season_context()}

The message should:
1. Be under 100 words
2. Reference the season/upcoming occasion naturally  
3. Suggest they check new arrivals in that category
4. End with a simple call to action
5. Sound human, NOT like marketing spam
6. Use max 1 emoji

Write ONLY the message text, nothing else."""

    response = llm.invoke(prompt)
    message_text = response.content.strip()

    # Send WhatsApp
    phone = user.get("phone")
    if phone:
        success = await send_whatsapp(
            to_phone=phone,
            message=message_text,
            quick_reply_buttons=["Show me styles", "Not now"]
        )

        if success:
            # Mark as notified — don't re-notify for 7 days
            await redis_client.setex(
                f"proactive:notified:{user_id}:{stale_info['category']}",
                604800,  # 7 days
                "1"
            )

            # Log the notification
            await db.notifications.insert_one({
                "user_id": user["_id"],
                "type": "proactive_reorder",
                "category": stale_info["category"],
                "message": message_text,
                "sent_at": datetime.now(),
                "channel": "whatsapp"
            })

def _get_season_context() -> str:
    month = datetime.now().month
    contexts = {
        9: "Durga Puja is coming up in Kolkata",
        10: "Diwali season is approaching",
        11: "Wedding season is here",
        12: "Christmas and New Year parties coming up",
        3: "Summer is starting — time for light fabrics",
        6: "Monsoon season has arrived"
    }
    return contexts.get(month, "New season arrivals are in")
```

```python
# backend/app/agents/tools/notification_tools.py
"""
Twilio WhatsApp integration.
Free trial gives $15 credit — enough for demo.
Setup: twilio.com → Sign up → WhatsApp Sandbox → follow instructions
"""

from twilio.rest import Client
import os

def get_twilio_client():
    return Client(
        os.environ["TWILIO_ACCOUNT_SID"],
        os.environ["TWILIO_AUTH_TOKEN"]
    )

async def send_whatsapp(
    to_phone: str,
    message: str,
    quick_reply_buttons: list = None
) -> bool:
    """
    Sends a WhatsApp message via Twilio.
    For hackathon: use Twilio Sandbox (free, no approval needed).
    Sandbox number: whatsapp:+14155238886
    User must first send "join <sandbox-keyword>" to activate.
    """
    try:
        client = get_twilio_client()

        from_number = f"whatsapp:{os.environ['TWILIO_WHATSAPP_NUMBER']}"
        to_number = f"whatsapp:{to_phone}"

        msg = client.messages.create(
            from_=from_number,
            to=to_number,
            body=message
        )

        print(f"WhatsApp sent: {msg.sid}")
        return True

    except Exception as e:
        print(f"WhatsApp send failed: {e}")
        return False
```

```python
# backend/app/celery_app.py
"""
Celery configuration with Beat schedule for Proactive Agent.
"""

from celery import Celery
from celery.schedules import crontab
import os

celery_app = Celery(
    "quickstyle",
    broker=os.environ["REDIS_URL"],
    backend=os.environ["REDIS_URL"],
    include=["app.agents.proactive_reorder_agent"]
)

celery_app.conf.beat_schedule = {
    "proactive-reorder-daily": {
        "task": "proactive_reorder_scan",
        "schedule": crontab(hour=9, minute=0),   # 9 AM every day IST
    }
}

celery_app.conf.timezone = "Asia/Kolkata"
```

---

## 14. LIVE DELIVERY TRACKING — GOOGLE MAPS + REAL-TIME PARTNER MOVEMENT

### Setup Google Maps API

```bash
# Get your free API key:
# console.cloud.google.com → Enable APIs:
#   - Maps JavaScript API
#   - Directions API
#   - Geocoding API (optional)
# Billing: $200 free credit/month covers ~28,000 map loads — more than enough

# Install frontend library
npm install @react-google-maps/api
```

### Backend — GPS Simulation WebSocket

```python
# backend/app/api/v1/tracking.py
"""
WebSocket endpoint that simulates real-time delivery partner GPS.
In production: the delivery partner app would push real coordinates.
For hackathon: we simulate movement along the actual Google Directions route.

The simulation is realistic:
- Uses real road coordinates from Google Directions API
- Adds small random jitter (like real GPS noise)
- Updates every 3 seconds
- ETA recalculates as partner moves
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.mongodb import get_db
from app.services.routing_service import get_route
from app.services.tracking_service import simulate_gps_movement
from bson import ObjectId
import asyncio, json

router = APIRouter()

@router.websocket("/ws/track/{order_id}")
async def track_order_ws(websocket: WebSocket, order_id: str):
    await websocket.accept()

    db = get_db()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})

    if not order:
        await websocket.send_json({"error": "Order not found"})
        await websocket.close()
        return

    store_loc = order.get("store_id") and await _get_store_location(db, order["store_id"])
    customer_loc = order["delivery_address"]["location"]

    # Get real road route from Google Directions
    route = await get_route(
        origin={"lat": store_loc["lat"], "lng": store_loc["lon"]},
        destination={"lat": customer_loc["lat"], "lng": customer_loc["lon"]}
    )

    # Save route to order for map display
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"route": route}}
    )

    # Stream GPS positions along the route
    try:
        async for position in simulate_gps_movement(route):
            if position["status"] == "delivered":
                await websocket.send_json({"status": "delivered", "eta_minutes": 0})
                # Update order status
                await db.orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {
                        "status": "delivered",
                        "delivery_partner.current_location": position,
                        "delivery_partner.last_location_update": position["timestamp"]
                    }}
                )
                break

            await websocket.send_json(position)

            # Update MongoDB with current location
            await db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {
                    "delivery_partner.current_location": {"lat": position["lat"], "lon": position["lon"]},
                    "delivery_partner.last_location_update": position["timestamp"]
                }}
            )

            await asyncio.sleep(3)  # Push every 3 seconds

    except WebSocketDisconnect:
        pass  # Client disconnected — stop streaming

async def _get_store_location(db, store_id):
    store = await db.stores.find_one({"_id": store_id})
    return store["location"] if store else {"lat": 22.5726, "lon": 88.4018}
```

```python
# backend/app/services/routing_service.py
"""
Google Directions API integration.
Returns encoded polyline + step-by-step route data.
"""

import httpx, os

DIRECTIONS_BASE = "https://maps.googleapis.com/maps/api/directions/json"

async def get_route(origin: dict, destination: dict) -> dict:
    """
    Fetches a real road route from Google Directions API.
    Returns: polyline, distance, duration, steps array
    """
    params = {
        "origin": f"{origin['lat']},{origin['lng']}",
        "destination": f"{destination['lat']},{destination['lng']}",
        "mode": "driving",
        "key": os.environ["GOOGLE_MAPS_API_KEY"]
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(DIRECTIONS_BASE, params=params)
        data = response.json()

    if data["status"] != "OK" or not data["routes"]:
        # Fallback: straight line if Directions API fails
        return _generate_fallback_route(origin, destination)

    route = data["routes"][0]
    leg = route["legs"][0]

    # Extract all step coordinates for smooth simulation
    all_step_coords = []
    for step in leg["steps"]:
        all_step_coords.append({
            "lat": step["start_location"]["lat"],
            "lng": step["start_location"]["lng"]
        })
    all_step_coords.append({
        "lat": leg["end_location"]["lat"],
        "lng": leg["end_location"]["lng"]
    })

    return {
        "polyline_encoded": route["overview_polyline"]["points"],
        "distance_km": leg["distance"]["value"] / 1000,
        "duration_minutes": leg["duration"]["value"] // 60,
        "steps": all_step_coords,
        "total_steps": len(all_step_coords)
    }

def _generate_fallback_route(origin: dict, destination: dict) -> dict:
    """Straight-line interpolation if Google API unavailable."""
    steps = 20
    coords = []
    for i in range(steps + 1):
        t = i / steps
        coords.append({
            "lat": origin["lat"] + (destination["lat"] - origin["lat"]) * t,
            "lng": origin["lng"] + (destination["lng"] - origin["lng"]) * t
        })
    return {
        "polyline_encoded": "",
        "distance_km": 3.0,
        "duration_minutes": 25,
        "steps": coords,
        "total_steps": len(coords)
    }
```

```python
# backend/app/services/tracking_service.py
"""
Simulates GPS movement along the route steps.
Adds realistic jitter, calculates bearing and ETA.
"""

import math, random
from datetime import datetime
from typing import AsyncGenerator

async def simulate_gps_movement(route: dict) -> AsyncGenerator[dict, None]:
    """
    Yields GPS positions along the route, one per step.
    Each step = 3 seconds in real time.
    """
    steps = route.get("steps", [])
    total_steps = len(steps)
    duration_minutes = route.get("duration_minutes", 25)

    for i, step in enumerate(steps):
        progress = i / max(total_steps - 1, 1)
        eta = int(duration_minutes * (1 - progress))

        # Calculate bearing to next step
        bearing = 0
        if i < len(steps) - 1:
            next_step = steps[i + 1]
            bearing = _calculate_bearing(
                step["lat"], step["lng"],
                next_step["lat"], next_step["lng"]
            )

        yield {
            "lat": step["lat"] + random.uniform(-0.0002, 0.0002),  # GPS jitter
            "lng": step["lng"] + random.uniform(-0.0002, 0.0002),
            "bearing": bearing,
            "eta_minutes": eta,
            "progress_percent": int(progress * 100),
            "status": "in_transit",
            "timestamp": datetime.now().isoformat()
        }

    # Final delivery event
    yield {"status": "delivered", "eta_minutes": 0, "timestamp": datetime.now().isoformat()}

def _calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate compass bearing between two GPS coordinates."""
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlon) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon)
    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360
```

---

## 15. SMART ROUTING — HIGHLIGHTED SHORTEST PATH

### Google Maps Directions Renderer (Frontend)

```typescript
// frontend/src/lib/googleMaps.ts
/**
 * Google Maps loader — loads the API once, reuses everywhere.
 * useJsApiLoader ensures the script is not loaded twice.
 */

export const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places", "geometry"] as const,
};

export const ROUTE_POLYLINE_OPTIONS = {
  strokeColor: "#FF6B35",          // QuickStyle brand orange
  strokeWeight: 5,
  strokeOpacity: 0.9,
  zIndex: 2
};

export const MAP_STYLES = [
  // Subtle grey map style — makes orange route pop visually
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];
```

```tsx
// frontend/src/components/map/LiveTrackingMap.tsx
/**
 * THE SWIGGY-LIKE LIVE TRACKING MAP.
 *
 * Shows:
 * 1. Google Map with custom grey style (orange route pops)
 * 2. Store pin (green bag icon)
 * 3. Customer pin (blue home icon)
 * 4. Delivery partner pin (orange bike icon) — MOVES every 3 seconds
 * 5. Orange route polyline along actual roads
 * 6. ETA badge updating in real time
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
  InfoWindow
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { GOOGLE_MAPS_CONFIG, ROUTE_POLYLINE_OPTIONS, MAP_STYLES } from "@/lib/googleMaps";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";

interface Props {
  orderId: string;
  storeLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  partnerInfo: { name: string; photo_url?: string; vehicle: string };
  initialRoute?: { polyline_encoded: string };
}

export const LiveTrackingMap: React.FC<Props> = ({
  orderId,
  storeLocation,
  customerLocation,
  partnerInfo,
  initialRoute
}) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Google Directions result (for DirectionsRenderer)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  // Live partner position from WebSocket
  const { partnerPosition, eta, isDelivered, progress } = useDeliveryTracking(orderId);

  // Fetch route from Google Directions API (client-side)
  const fetchDirections = useCallback(() => {
    if (!isLoaded || !window.google) return;

    const service = new window.google.maps.DirectionsService();
    service.route({
      origin: storeLocation,
      destination: customerLocation,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === "OK" && result) {
        setDirections(result);
      }
    });
  }, [isLoaded, storeLocation, customerLocation]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  // Custom icons
  const storeIcon = isLoaded ? {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="#10B981"/>
        <text x="18" y="23" font-size="16" text-anchor="middle">🏪</text>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(36, 36),
    anchor: new window.google.maps.Point(18, 18)
  } : undefined;

  const homeIcon = isLoaded ? {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="#3B82F6"/>
        <text x="18" y="23" font-size="16" text-anchor="middle">🏠</text>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(36, 36),
    anchor: new window.google.maps.Point(18, 18)
  } : undefined;

  const bikeIcon = isLoaded ? {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="22" fill="#FF6B35" stroke="white" stroke-width="3"/>
        <text x="22" y="28" font-size="18" text-anchor="middle">🛵</text>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22)
  } : undefined;

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* ETA Badge — floating over the map */}
      <AnimatePresence>
        {!isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-800">
              {eta > 0 ? `${eta} min away` : "Arriving now"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery complete banner */}
      <AnimatePresence>
        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur rounded-2xl"
          >
            <div className="text-center">
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-gray-800">Delivered!</p>
              <p className="text-sm text-gray-500">Enjoy your outfit</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Map */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "280px", borderRadius: "1rem" }}
        zoom={14}
        center={partnerPosition || storeLocation}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative"
        }}
      >
        {/* Route polyline — draws the actual road path */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: ROUTE_POLYLINE_OPTIONS,
              suppressMarkers: true,   // We use our own custom markers
            }}
          />
        )}

        {/* Store pin */}
        <Marker position={storeLocation} icon={storeIcon} title="Store" />

        {/* Customer pin */}
        <Marker position={customerLocation} icon={homeIcon} title="Your location" />

        {/* Delivery partner — the moving dot */}
        {partnerPosition && (
          <Marker
            position={partnerPosition}
            icon={bikeIcon}
            title={`${partnerInfo.name} is on the way`}
          />
        )}
      </GoogleMap>

      {/* Progress bar below map */}
      <div className="mt-3 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-orange-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>🏪 Store</span>
        <span>🏠 Your door</span>
      </div>
    </div>
  );
};
```

```typescript
// frontend/src/hooks/useDeliveryTracking.ts
/**
 * WebSocket hook for live GPS tracking.
 * Connects to /api/v1/tracking/ws/{orderId}
 * Updates partnerPosition every 3 seconds.
 */

import { useState, useEffect, useRef } from "react";

interface TrackingPosition {
  lat: number;
  lng: number;
  bearing: number;
  eta_minutes: number;
  progress_percent: number;
  status: string;
}

export const useDeliveryTracking = (orderId: string) => {
  const [partnerPosition, setPartnerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number>(30);
  const [isDelivered, setIsDelivered] = useState(false);
  const [progress, setProgress] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/v1/tracking/ws/${orderId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: TrackingPosition = JSON.parse(event.data);

      if (data.status === "delivered") {
        setIsDelivered(true);
        setEta(0);
        setProgress(100);
        ws.close();
        return;
      }

      setPartnerPosition({ lat: data.lat, lng: data.lng });
      setEta(data.eta_minutes);
      setProgress(data.progress_percent);
    };

    ws.onerror = (e) => console.error("Tracking WS error:", e);

    return () => {
      ws.close();
    };
  }, [orderId]);

  return { partnerPosition, eta, isDelivered, progress };
};
```

```tsx
// frontend/src/routes/customer/OrderStatus.tsx
/**
 * Full order status page with:
 * - Order timeline (placed → confirmed → packed → out for delivery → delivered)
 * - Live tracking map (Google Maps with moving partner dot)
 * - Delivery partner info card
 */

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LiveTrackingMap } from "@/components/map/LiveTrackingMap";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, Home } from "lucide-react";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "packed", label: "Packed", icon: Package },
  { key: "out_for_delivery", label: "On the way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home }
];

export const OrderStatus = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(r => r.data),
    refetchInterval: 15000  // Refresh order data every 15s
  });

  if (!order) return <div className="p-4 text-center text-gray-400">Loading order...</div>;

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isOutForDelivery = order.status === "out_for_delivery";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b">
        <p className="text-xs text-gray-400">Order #{order.order_number}</p>
        <h1 className="text-lg font-bold text-gray-800">Track Your Order</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* STATUS TIMELINE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

            {STATUS_STEPS.map((step, i) => {
              const isComplete = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 mb-4 last:mb-0 relative"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                    isComplete ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-300"
                  } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isComplete ? "text-gray-800" : "text-gray-300"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-orange-500 font-medium">Current status</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* LIVE MAP — only shown when out for delivery */}
        {isOutForDelivery && order.delivery_partner && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              📍 Live Tracking
            </h2>

            {/* Delivery partner info */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-orange-50 rounded-xl">
              <img
                src={order.delivery_partner.photo_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=delivery"}
                alt={order.delivery_partner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{order.delivery_partner.name}</p>
                <p className="text-xs text-gray-500">Your delivery partner 🛵</p>
              </div>
              <a
                href={`tel:${order.delivery_partner.phone}`}
                className="ml-auto bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full"
              >
                Call
              </a>
            </div>

            {/* THE MAP */}
            <LiveTrackingMap
              orderId={orderId!}
              storeLocation={{
                lat: order.store_location?.lat || 22.5726,
                lng: order.store_location?.lon || 88.4018
              }}
              customerLocation={{
                lat: order.delivery_address.location.lat,
                lng: order.delivery_address.location.lon
              }}
              partnerInfo={order.delivery_partner}
            />
          </div>
        )}

        {/* ORDER ITEMS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h2>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">{item.brand} · Size {item.size}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 16. 360° PRODUCT VIEWER — VIDEO FRAME EXTRACTION METHOD

### The Concept: Shoot Video → Extract 24 WebP Frames → Drag to Rotate

**Why 24 frames, not 36:**
24 frames at 15° per step is indistinguishable from 36 frames in practice. 33% fewer images, 33% faster load, same visual quality.

**Why WebP, not JPG:**
WebP is ~55% smaller than JPG at the same visual quality. 24 frames × ~35KB = ~840KB total per product. Trivial.

### Step 1: Shoot the Video

```
HOW TO SHOOT A 360° PRODUCT VIDEO:
1. Place shirt on mannequin or hanger (mannequin looks better)
2. Keep camera completely still — ideally on a tripod
3. Slowly rotate the mannequin/hanger in front of camera
4. Record at least 10 seconds of clean rotation
5. Ensure consistent lighting throughout
6. Neutral background (white/grey wall) preferred

Alternatively:
- Walk slowly around the hanging garment in a circle
- Use a lazy Susan turntable under the mannequin (best option)
```

### Step 2: Extract 24 Frames with FFmpeg

```bash
# Install FFmpeg (free, open source)
# Mac:    brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: download from ffmpeg.org

# Basic extraction — 24 frames from a 10-second video
ffmpeg -i shirt_rotation.mp4 \
  -vf "fps=24/10,scale=800:800:force_original_aspect_ratio=decrease,pad=800:800:(ow-iw)/2:(oh-ih)/2" \
  -q:v 75 \
  frame_%02d.webp

# What this does:
# fps=24/10           → extract exactly 24 frames over 10 seconds
# scale=800:800       → resize to 800×800 (square)
# pad=800:800:...     → pad non-square footage to square with whitespace
# -q:v 75             → WebP quality 75 (good quality, small file)
# frame_%02d.webp     → output: frame_00.webp through frame_23.webp

# Result: 24 .webp files, approximately 25-45KB each, ~840KB total
```

### Step 3: Backend Upload Endpoint

```python
# backend/app/api/v1/products.py  (360° upload endpoint)
"""
Accepts either:
A) A ZIP of exactly 24 pre-extracted WebP/JPG frames
B) A raw video file (MP4/MOV) — server extracts frames using FFmpeg
"""

import zipfile, io, subprocess, tempfile, os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image
from google.cloud import storage
from app.db.mongodb import get_db
from bson import ObjectId

router = APIRouter()

REQUIRED_FRAME_COUNT = 24

@router.post("/{product_id}/upload-360")
async def upload_360(
    product_id: str,
    file: UploadFile = File(...),
    current_user = Depends(require_role("shopkeeper", "admin"))
):
    """
    Handles both video upload and pre-extracted frame ZIP upload.
    """
    filename = file.filename.lower()

    if filename.endswith((".mp4", ".mov", ".avi", ".webm")):
        # Video upload — extract frames server-side
        frame_images = await _extract_frames_from_video(file)
    elif filename.endswith(".zip"):
        # ZIP of pre-extracted frames
        frame_images = await _extract_frames_from_zip(file)
    else:
        raise HTTPException(400, "Upload a .mp4 video or a .zip of 24 frame images")

    if len(frame_images) != REQUIRED_FRAME_COUNT:
        raise HTTPException(
            400,
            f"Need exactly {REQUIRED_FRAME_COUNT} frames. Got {len(frame_images)}. "
            "If uploading video, ensure it shows one complete 360° rotation."
        )

    # Upload all 24 frames to GCS
    cdn_urls = await _upload_frames_to_gcs(product_id, frame_images)

    # Update MongoDB
    db = get_db()
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {
            "colors.0.images.frames_360": cdn_urls,
            "colors.0.images.has_360": True
        }}
    )

    return {
        "success": True,
        "frames_uploaded": len(cdn_urls),
        "total_size_kb": sum(len(img) for img in frame_images) // 1024,
        "sample_url": cdn_urls[0]
    }


async def _extract_frames_from_video(file: UploadFile) -> list[bytes]:
    """Uses FFmpeg to extract exactly 24 WebP frames from a video."""

    with tempfile.TemporaryDirectory() as tmpdir:
        # Save uploaded video to temp file
        video_path = os.path.join(tmpdir, "input_video" + os.path.splitext(file.filename)[1])
        video_bytes = await file.read()
        with open(video_path, "wb") as f:
            f.write(video_bytes)

        output_pattern = os.path.join(tmpdir, "frame_%02d.webp")

        # Run FFmpeg — extract 24 frames, resize to 800x800, WebP quality 80
        result = subprocess.run([
            "ffmpeg",
            "-i", video_path,
            "-vf", f"fps={REQUIRED_FRAME_COUNT}/10,scale=800:800:force_original_aspect_ratio=decrease,pad=800:800:(ow-iw)/2:(oh-ih)/2:color=white",
            "-q:v", "80",
            output_pattern,
            "-y"
        ], capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            raise HTTPException(500, f"FFmpeg frame extraction failed: {result.stderr}")

        # Read extracted frames
        frames = []
        for i in range(REQUIRED_FRAME_COUNT):
            frame_path = os.path.join(tmpdir, f"frame_{i+1:02d}.webp")
            if os.path.exists(frame_path):
                with open(frame_path, "rb") as f:
                    frames.append(f.read())

        return frames


async def _extract_frames_from_zip(file: UploadFile) -> list[bytes]:
    """Extracts and processes image frames from a ZIP file."""
    zip_bytes = await file.read()

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        image_names = sorted([
            n for n in zf.namelist()
            if n.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
            and not n.startswith('__MACOSX')
        ])

        frames = []
        for img_name in image_names:
            img_bytes = zf.read(img_name)

            # Convert to WebP if not already
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            img = img.resize((800, 800), Image.LANCZOS)

            output = io.BytesIO()
            img.save(output, format="WEBP", quality=80, method=6)
            frames.append(output.getvalue())

        return frames


async def _upload_frames_to_gcs(product_id: str, frames: list[bytes]) -> list[str]:
    """Uploads all frames to Google Cloud Storage and returns public URLs."""
    gcs_client = storage.Client()
    bucket = gcs_client.bucket(os.environ["GCS_BUCKET_NAME"])
    cdn_urls = []

    for i, frame_bytes in enumerate(frames):
        blob = bucket.blob(f"products/{product_id}/360/{i:02d}.webp")
        blob.upload_from_string(frame_bytes, content_type="image/webp")
        blob.make_public()
        cdn_urls.append(blob.public_url)

    return cdn_urls
```

### Step 4: Frontend 360° Viewer Component

```tsx
// frontend/src/components/product/Product360Viewer.tsx
/**
 * 24-frame WebP drag viewer.
 *
 * HOW IT WORKS:
 * - All 24 WebP frames are preloaded into browser memory
 * - @use-gesture/react tracks finger/mouse drag distance
 * - Every 8px of drag = 1 frame change
 * - Wraps around at frame 24 (continuous rotation)
 * - Shows progress bar while frames are loading
 * - Works identically on mobile touch and desktop mouse
 */

import { useGesture } from "@use-gesture/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FRAME_COUNT = 24;
const PIXELS_PER_FRAME = 8;  // Drag sensitivity

interface Props {
  frames: string[];     // Array of 24 WebP CDN URLs
  className?: string;
}

export const Product360Viewer: React.FC<Props> = ({ frames, className = "" }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);

  const startFrameRef = useRef(0);
  const preloadedImages = useRef<HTMLImageElement[]>([]);
  const autoSpinRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all 24 frames in background
  useEffect(() => {
    preloadedImages.current = frames.map((url) => {
      const img = new Image();
      img.onload = () => setLoadedCount(prev => prev + 1);
      img.src = url;
      return img;
    });
  }, [frames]);

  // Auto-spin slowly until user interacts — gives demo polish
  useEffect(() => {
    if (!isAutoSpinning) return;

    autoSpinRef.current = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % FRAME_COUNT);
    }, 80);  // ~12fps auto-spin

    return () => {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
    };
  }, [isAutoSpinning]);

  const loadProgress = (loadedCount / FRAME_COUNT) * 100;
  const isFullyLoaded = loadedCount >= FRAME_COUNT;

  const bind = useGesture(
    {
      onDrag: ({ movement: [mx], first }) => {
        if (first) {
          startFrameRef.current = currentFrame;
          setHasInteracted(true);
          setIsAutoSpinning(false);  // Stop auto-spin on first touch
          if (autoSpinRef.current) clearInterval(autoSpinRef.current);
        }
        const frameDelta = Math.floor(-mx / PIXELS_PER_FRAME);
        const newFrame = ((startFrameRef.current + frameDelta) % FRAME_COUNT + FRAME_COUNT) % FRAME_COUNT;
        setCurrentFrame(newFrame);
      }
    },
    { drag: { axis: "x", preventDefault: true } }
  );

  return (
    <div className={`relative select-none overflow-hidden rounded-2xl bg-gray-50 ${className}`}>
      {/* Loading progress bar */}
      {!isFullyLoaded && (
        <div className="absolute top-0 left-0 right-0 z-20">
          <motion.div
            className="h-0.5 bg-orange-500"
            animate={{ width: `${loadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* 360° Image canvas */}
      <div
        {...bind()}
        className="cursor-grab active:cursor-grabbing w-full"
        style={{ touchAction: "none" }}
      >
        <img
          src={frames[currentFrame] || frames[0]}
          alt={`360° product view — frame ${currentFrame + 1} of ${FRAME_COUNT}`}
          className="w-full h-auto block"
          draggable={false}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
        />
      </div>

      {/* 360° badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
        <span>↺</span> 360°
      </div>

      {/* Frame indicator dots (12 dots represent 24 frames in groups of 2) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const groupIndex = Math.floor(currentFrame / 2);
          return (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all duration-150 ${
                i === groupIndex ? "w-4 bg-white" : "w-1 bg-white/40"
              }`}
            />
          );
        })}
      </div>

      {/* First-time interaction hint */}
      <AnimatePresence>
        {!hasInteracted && isFullyLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, exit: { duration: 0.3 } }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none"
          >
            ← Drag to rotate →
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

## 17. BACKEND API — EVERY ENDPOINT

```python
# Complete endpoint inventory

# AUTH
POST   /api/v1/auth/register          # Create account
POST   /api/v1/auth/login             # JWT login
GET    /api/v1/auth/me                # Current user profile

# PRODUCTS
GET    /api/v1/products               # List with filters
GET    /api/v1/products/{id}          # Single product + fit score
POST   /api/v1/products               # Create (shopkeeper)
PUT    /api/v1/products/{id}/stock    # Update stock
POST   /api/v1/products/{id}/upload-360   # 360° video or ZIP upload
DELETE /api/v1/products/{id}          # Soft delete

# ORDERS
POST   /api/v1/orders                 # Place order
GET    /api/v1/orders/{id}            # Get order + route data
GET    /api/v1/orders/my              # Customer's orders
PUT    /api/v1/orders/{id}/status     # Update status (shopkeeper)

# TRACKING — NEW
WS     /api/v1/tracking/ws/{order_id} # Live GPS stream WebSocket
GET    /api/v1/tracking/{order_id}/route  # Get Google Directions route

# CHAT
WS     /api/v1/chat/ws/{session_id}   # Main chat WebSocket

# SEARCH
GET    /api/v1/search                 # Elasticsearch product search
POST   /api/v1/search/vector          # Vector similarity search

# TRENDS — NEW
GET    /api/v1/trends                 # Hyperlocal trend data (area param)

# PAYMENTS
POST   /api/v1/payments/create-order  # Razorpay order creation
POST   /api/v1/payments/verify        # Payment verification

# ADMIN
GET    /api/v1/admin/metrics          # Platform KPIs
GET    /api/v1/admin/agent-logs       # All agent activity
GET    /api/v1/admin/negotiations     # All negotiation logs — NEW
POST   /api/v1/admin/inject-bug       # Demo bug injection
POST   /api/v1/admin/trigger-devops   # Manually trigger DevOps agent
POST   /api/v1/admin/trigger-proactive/{user_id}  # Test proactive agent — NEW

# SEED
POST   /api/v1/seed/products          # Seed product catalog
POST   /api/v1/seed/synthetic-users   # Run Synthetic Data Agent
POST   /api/v1/seed/trends            # Pre-populate trend cache
```

---

## 18. FRONTEND — EVERY PAGE & COMPONENT

### Updated Chat.tsx with Negotiation Display

```tsx
// In Chat.tsx — handle negotiation events
useEffect(() => {
  socket.on("agent_event", (data) => {
    // Standard status updates
    const statusMessages: Record<string, string> = {
      "stylist_agent:elasticsearch_search": "🔍 Searching 10,000 products...",
      "stylist_agent:proposal_ready": `👗 Stylist recommends: ${data.details?.product}`,
      "anti_return_agent:verdict_complete": data.details?.objection
        ? `📏 Anti-Return: OBJECTION raised`
        : `📏 Anti-Return: Approved`,
      "negotiation_mediator:conflict_resolved": "✅ Supervisor: Decision made",
      "outfit_completion_agent:suggestions_ready": "✨ Finding matching items...",
    };

    const key = `${data.agent}:${data.action}`;
    if (statusMessages[key]) setAgentStatus(statusMessages[key]);

    // NEW: show negotiation in chat inline if it's interesting
    if (data.negotiation_line) {
      setNegotiationLines(prev => [...prev, data.negotiation_line]);
    }
  });
}, [socket]);

// In the messages render area — show negotiation when it happens
{negotiationLines.length > 0 && isProcessing && (
  <NegotiationCard lines={negotiationLines} />
)}
```

```tsx
// frontend/src/components/chat/NegotiationCard.tsx
/**
 * Shows the agent argument in real-time inside the chat.
 * Each line animates in as it's received via WebSocket.
 */

import { motion, AnimatePresence } from "framer-motion";

export const NegotiationCard: React.FC<{ lines: string[] }> = ({ lines }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="ml-10 bg-gray-900 rounded-xl p-3 font-mono text-xs space-y-1.5"
  >
    <p className="text-gray-400 text-[10px] mb-2 uppercase tracking-wider">⚡ Agent Negotiation</p>
    <AnimatePresence initial={false}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`leading-relaxed ${
            line.includes("OBJECTION") ? "text-red-400" :
            line.includes("Supervisor") ? "text-yellow-400" :
            line.includes("APPROVED") || line.includes("Approved") ? "text-green-400" :
            "text-gray-300"
          }`}
        >
          {line}
        </motion.p>
      ))}
    </AnimatePresence>
  </motion.div>
);
```

---

## 19. REAL-TIME LAYER

### Updated Redis Channels

```python
# backend/app/db/redis_client.py
"""
Pub/Sub channel directory (updated):

channel:agents          → All agent events → Admin terminal + customer status bar
channel:negotiation     → Negotiation-specific events → Negotiation terminal card
channel:orders:{uid}    → Order status updates → Customer order page
channel:tracking:{oid}  → GPS coordinates → Customer tracking map
channel:admin           → Admin dashboard global events
channel:devops          → DevOps agent events → DevOps panel
"""

import redis.asyncio as aioredis
import os, json

redis_client: aioredis.Redis = None

async def connect_redis():
    global redis_client
    redis_client = aioredis.from_url(
        os.environ["REDIS_URL"],
        encoding="utf-8",
        decode_responses=True,
        max_connections=100
    )
    await redis_client.ping()

async def publish(channel: str, message: dict):
    await redis_client.publish(channel, json.dumps(message))
```

---

## 20. AGENT BRAIN DASHBOARD — UPDATED WITH NEGOTIATION TERMINAL

```tsx
// frontend/src/routes/admin/AgentBrain.tsx  (updated sections)

// Add new negotiation section to the dashboard

const NEGOTIATION_COLORS = {
  "negotiation_conflict": "text-red-400",
  "negotiation_resolved": "text-green-400",
  "negotiation_forced": "text-yellow-400",
  "stylist_agent:proposal_ready": "text-pink-400",
  "anti_return_agent:verdict_complete": "text-amber-400",
};

// In the render — add Negotiation Replay section below the terminal:
<div className="mt-6">
  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
    Recent Agent Negotiations
  </h2>
  <div className="space-y-3">
    {negotiations.map((neg, i) => (
      <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">
            Session: {neg.session_id.slice(-8)}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            neg.outcome.total_rounds === 1
              ? "bg-green-100 text-green-700"
              : neg.outcome.total_rounds === 2
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            {neg.outcome.total_rounds} round{neg.outcome.total_rounds !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 mb-1">
          Final: {neg.outcome.final_product_name}
        </p>
        <p className="text-xs text-gray-400">
          Confidence: {Math.round(neg.outcome.final_confidence * 100)}% · {neg.outcome.total_ms}ms
        </p>
      </div>
    ))}
  </div>
</div>
```

---

## 21. SELF-HEALING DEVOPS AGENT

*(Unchanged from v2 — this is already the strongest feature. Keep it exactly as designed.)*

The DevOps Agent with GitLab MCP remains the hackathon showstopper. Every other addition in v3 builds up to this moment.

Key components:
- `backend/app/agents/devops_agent.py` — main orchestration
- `backend/app/agents/tools/gitlab_tools.py` — GitLab REST API
- `frontend/src/routes/admin/DevOpsPanel.tsx` — real-time MR creation display

Refer to v2 architecture Section 11 for full implementation. No changes needed.

---

## 22. SYNTHETIC DATA ENGINE

*(Unchanged from v2. Add `purchase_history` field to generated users for Proactive Agent.)*

```python
# In synthetic_data_agent.py — add purchase_history to each generated user:
user["purchase_history"] = [
    {
        "category": random.choice(["women_ethnic", "women_western", "footwear"]),
        "subcategory": random.choice(["kurta", "dress", "sandals", "jeans"]),
        "brand": random.choice(list(BRAND_PROFILES.keys())),
        "purchased_at": datetime.now() - timedelta(days=random.randint(30, 180)),
        "season": random.choice(["summer", "monsoon", "festive", "winter"])
    }
    for _ in range(random.randint(2, 6))
]
user["notification_prefs"] = {
    "whatsapp_enabled": True,
    "proactive_suggestions": True,
    "last_notified_at": None
}
```

---

## 23. SAFETY AND GUARDRAILS

*(All 6 layers from v2 retained. One addition for voice input.)*

```python
# Additional layer for voice input safety
# backend/app/middleware/safety_filter.py

# Voice transcripts go through the same Safety Agent as text
# No additional code needed — the Web Speech API processes voice
# client-side and sends the transcript as a regular text message
# to the WebSocket. Safety Agent handles it identically.

# One addition: max transcript length check
MAX_VOICE_TRANSCRIPT_CHARS = 500
if len(transcript) > MAX_VOICE_TRANSCRIPT_CHARS:
    transcript = transcript[:MAX_VOICE_TRANSCRIPT_CHARS]
```

---

## 24. PAYMENT FLOW

*(Unchanged from v2. Agentic one-message checkout retained.)*

```python
# Payment flow summary:
# 1. User says "Buy it" in chat
# 2. Payment Agent checks pre-authorized budget in Redis
# 3. If within budget: charge, create order, soft-reserve stock
# 4. Trigger tracking WebSocket setup for the new order
# 5. Return: "Done! ₹1,899 charged. Track your order 📍"

# NEW in v3: after payment success, also trigger Outfit Completion Agent
# to suggest complementary items as upsell

async def post_payment_hooks(order_id: str, product: dict, session_id: str):
    """Called after successful payment."""
    # Start the tracking simulation
    await setup_tracking_for_order(order_id)

    # Trigger outfit suggestions (non-blocking)
    asyncio.create_task(
        trigger_outfit_suggestions(product, session_id)
    )
```

---

## 25. ENVIRONMENT VARIABLES

```bash
# ══════════════════════════════════════════════
# GOOGLE CLOUD
# ══════════════════════════════════════════════
GCP_PROJECT_ID=quickstyle-hackathon-2025
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-service-account.json
GCS_BUCKET_NAME=quickstyle-media

# ══════════════════════════════════════════════
# GOOGLE MAPS — NEW
# Get: console.cloud.google.com
# Enable: Maps JavaScript API + Directions API
# ══════════════════════════════════════════════
GOOGLE_MAPS_API_KEY=AIzaSy_your_maps_key_here
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_your_maps_key_here  # Frontend needs it too

# ══════════════════════════════════════════════
# GEMINI / VERTEX AI
# ══════════════════════════════════════════════
GEMINI_API_KEY=AIzaSy_your_gemini_key_here

# ══════════════════════════════════════════════
# MONGODB ATLAS (free M0)
# ══════════════════════════════════════════════
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/quickstyle

# ══════════════════════════════════════════════
# REDIS (Upstash free tier)
# ══════════════════════════════════════════════
REDIS_URL=rediss://default:token@global-fly.upstash.io:6380

# ══════════════════════════════════════════════
# ELASTICSEARCH
# ══════════════════════════════════════════════
ELASTIC_URL=https://quickstyle.es.us-east-1.aws.elastic.cloud:443
ELASTIC_API_KEY=base64_encoded_key_here

# ══════════════════════════════════════════════
# TAVILY (hyperlocal trends)
# Get: tavily.com → free 1000 req/month
# ══════════════════════════════════════════════
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx

# ══════════════════════════════════════════════
# TWILIO WHATSAPP (proactive agent) — NEW
# Get: twilio.com → free $15 trial credit
# Setup: twilio.com/console → Messaging → Try it out → WhatsApp
# ══════════════════════════════════════════════
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886   # Twilio sandbox number

# ══════════════════════════════════════════════
# RAZORPAY (test mode)
# ══════════════════════════════════════════════
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret

# ══════════════════════════════════════════════
# GITLAB (DevOps agent)
# ══════════════════════════════════════════════
GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
GITLAB_REPO_PATH=yourname/quickstyle

# ══════════════════════════════════════════════
# DYNATRACE (optional — mock works without it)
# ══════════════════════════════════════════════
DYNATRACE_API_TOKEN=dt0c01.xxxxxxxxxx
DYNATRACE_ENV_ID=your-env-id

# ══════════════════════════════════════════════
# SECURITY
# ══════════════════════════════════════════════
JWT_SECRET=generate_64_char_random_hex_here

# ══════════════════════════════════════════════
# FRONTEND (Vite — must start with VITE_)
# ══════════════════════════════════════════════
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_your_maps_key_here
```

---

## 26. DOCKER COMPOSE

```yaml
# docker-compose.yml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_WS_URL=ws://localhost:8000
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./backend:/app
      - ./secrets:/app/secrets:ro
    depends_on:
      - mongodb
      - redis
      - elasticsearch
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  celery_worker:
    build:
      context: ./backend
    # ffmpeg must be installed in the Docker image for 360° processing
    command: celery -A app.celery_app worker --loglevel=info -Q default,devops,proactive
    env_file: .env
    volumes:
      - ./backend:/app
      - ./secrets:/app/secrets:ro
    depends_on:
      - redis
      - mongodb

  celery_beat:
    build:
      context: ./backend
    command: celery -A app.celery_app beat --loglevel=info
    env_file: .env
    depends_on:
      - redis

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: quickstyle123
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - es_data:/usr/share/elasticsearch/data

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  mongo_data:
  redis_data:
  es_data:
```

### Backend Dockerfile — includes FFmpeg for 360° processing

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

# Install FFmpeg for 360° video frame extraction
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 27. AI BUILD INSTRUCTIONS — PROMPT BY PROMPT

```
STEP 1 — PROJECT SCAFFOLD
"Create a new project called 'quickstyle' with the directory structure from
Section 5. Initialize frontend with Vite React TypeScript. Install backend
dependencies: fastapi uvicorn motor redis elasticsearch langchain
langchain-google-vertexai langgraph google-cloud-aiplatform google-cloud-storage
python-jose passlib httpx Pillow python-multipart pydantic loguru python-dotenv
razorpay tavily-python twilio ffmpeg-python celery. Create docker-compose.yml
from Section 26."

STEP 2 — DATABASE LAYER
"Create all MongoDB models and database connection files from Section 6.
Include the new collections: negotiation_logs, trends.
Create redis_client.py with all pub/sub channels from Section 19."

STEP 3 — AGENT NEGOTIATION SYSTEM (most important new feature)
"Implement the Agent Negotiation system from Section 8.
1. Create negotiation_mediator.py with negotiation_mediator_node
2. Update stylist_agent.py to accept excluded_brands and emit negotiation_line
3. Update anti_return_agent.py to formally raise objections with evidence
4. Update supervisor.py to use NegotiationGraph with the loop:
   stylist → anti_return → mediator → (loop back to stylist OR proceed)
5. The negotiation loop must broadcast events to channel:negotiation Redis channel
6. Max 3 rounds before Supervisor forces a decision"

STEP 4 — NEW AGENTS
"Implement all new agents from the architecture:
1. outfit_completion_agent.py (Section 10) — finds complementary products
2. trend_agent.py (Section 11) — Tavily hyperlocal trend scraping with Redis cache
3. proactive_reorder_agent.py (Section 13) — Celery Beat daily task + Twilio WhatsApp
4. Add outfit_search() to elastic_tools.py
5. Add send_whatsapp() to notification_tools.py"

STEP 5 — LIVE TRACKING + MAPS
"Implement the live delivery tracking system from Sections 14 and 15:
1. backend/app/api/v1/tracking.py — WebSocket GPS streaming endpoint
2. backend/app/services/routing_service.py — Google Directions API wrapper
3. backend/app/services/tracking_service.py — GPS simulation along route steps
4. frontend: install @react-google-maps/api
5. frontend/src/lib/googleMaps.ts — Maps config + polyline options + map styles
6. frontend/src/components/map/LiveTrackingMap.tsx — full map with moving partner
7. frontend/src/hooks/useDeliveryTracking.ts — WebSocket tracking hook
8. frontend/src/routes/customer/OrderStatus.tsx — full tracking page"

STEP 6 — 360° VIEWER
"Implement 360° product viewer from Section 16:
1. backend/app/api/v1/products.py — upload-360 endpoint accepting video or ZIP
2. backend/app/services/frame_extraction_service.py — FFmpeg video processing
3. frontend/src/components/product/Product360Viewer.tsx — 24-frame WebP drag viewer
FFmpeg command: fps=24/10, scale=800:800, WebP quality 80"

STEP 7 — VOICE INPUT
"Implement voice input from Section 9:
1. frontend/src/hooks/useVoiceInput.ts — Web Speech API hook
2. frontend/src/components/chat/VoiceInputButton.tsx — animated mic button
3. Update Chat.tsx to include VoiceInputButton next to send button
4. On transcript ready: populate text input AND auto-send the message"

STEP 8 — FIT CONFIDENCE BADGES
"Implement FitConfidenceBadge from Section 12:
1. frontend/src/components/product/FitConfidenceBadge.tsx
2. Add badge to ProductCard.tsx and ProductSuggestionCard.tsx
3. Populate fit_score in product API responses from anti_return assessment"

STEP 9 — HYPERLOCAL TRENDS FRONTEND
"Implement HyperlocalTrendingSection from Section 11:
1. frontend/src/components/product/TrendingBanner.tsx — updated with hyperlocal
2. backend/app/api/v1/trends.py — REST endpoint
3. Add to Home.tsx below the seasonal hero"

STEP 10 — OUTFIT COMPLETION FRONTEND
"Implement OutfitCompletionCard from Section 10:
1. frontend/src/components/product/OutfitCompletionCard.tsx
2. Update Chat.tsx to show OutfitCompletionCard when outfit_suggestions in response
3. Outfit suggestions appear after the product cards in the chat"

STEP 11 — AGENT BRAIN DASHBOARD UPDATE
"Update AgentBrain.tsx from Section 20:
1. Add NegotiationReplayCard component showing recent negotiation logs
2. Handle negotiation event types in the terminal color coding
3. Add negotiation statistics (avg rounds, objection rate) to metric cards
4. Fetch negotiation logs from /api/v1/admin/negotiations"

STEP 12 — NEGOTIATION CARD IN CHAT
"Implement NegotiationCard from Section 18:
1. frontend/src/components/chat/NegotiationCard.tsx
2. In Chat.tsx: listen for negotiation_line in agent_event WebSocket messages
3. Show NegotiationCard inside chat while processing (real-time terminal in chat)"

STEP 13 — DATA SEEDING
"Update seed scripts:
1. scripts/seed_products.py — add outfit_tags and pairs_well_with fields
2. scripts/seed_products.py — add fit_confidence_avg field per product
3. Update synthetic_data_agent.py — add purchase_history and notification_prefs
4. Create scripts/seed_trends.py — pre-populate Kolkata area trends in Redis"
```

---

## 28. HACKATHON VIDEO SCRIPT — UPDATED 3-MINUTE PLAN

```
[0:00 – 0:08]  TITLE CARD
Show: QuickStyle logo
Voiceover: "What if your AI stylist, inventory manager, delivery coordinator,
and platform engineer were all AI agents — arguing with each other to serve
you better?"

[0:08 – 0:20]  THE PROBLEM
Show: Indian fashion returns data, overwhelming catalogs, slow delivery
Voiceover: "₹4,000 crore in fashion returns annually. We built QuickStyle
to cut returns, speed discovery, and deliver in 30 minutes — with AI agents
that genuinely collaborate."

[0:20 – 0:45]  VOICE TO STYLE — THE OPENING WOW
Show: Phone screen. User taps microphone button. Speaks:
"Yellow dress for brunch under 2000 rupees, size M"
Show: Voice bars animating, transcript populating automatically
Show: Agent status bar animating — "Searching..." "Analyzing..."
Show: 3 product cards appear with Gemini Vision style note in amber card
Voiceover: "Voice-first shopping. Our Stylist Agent runs hybrid semantic
search across 10,000 products. Gemini Vision analyzes the user's photo
and generates a personalized style note."

[0:45 – 1:15]  THE AGENT ARGUMENT — THE KEY SCENE
Show: Admin Agent Brain terminal
Show: New order coming in, terminal scrolling...
Then: the negotiation sequence plays out live:
  [12:34:02] ⟳ 👗 Stylist Agent → Recommending: Zara Yellow Dress (confidence: 89%)
  [12:34:02] ⟳ 📏 Anti-Return Agent → OBJECTION: User returned Zara 2x. Confidence: 41%
  [12:34:02] ⚠️ Supervisor → Conflict. Asking Stylist to reconsider...
  [12:34:03] ⟳ 👗 Stylist Agent → Round 2: Recommending H&M Yellow Dress (84%)
  [12:34:03] ✓ 📏 Anti-Return Agent → APPROVED: No return risk (84%)
  [12:34:03] ✅ Supervisor → Conflict resolved. Serving H&M recommendation.
Voiceover: "This is genuine multi-agent AI. The Stylist Agent recommends.
The Anti-Return Agent objects — with evidence. They negotiate. The Supervisor
mediates. This isn't a pipeline. These agents are actually arguing."

[1:15 – 1:30]  FIT CONFIDENCE + OUTFIT COMPLETION
Show: Product card with green "84% Fit" badge
Show: Below the products: "Complete the Look" card with matching bag + sandals
Voiceover: "Every product shows a live Fit Confidence score — AI-visible
to the customer. After purchase, the Outfit Completion Agent automatically
finds matching pieces from nearby stores."

[1:30 – 2:00]  LIVE DELIVERY TRACKING
Show: After buying, user sees OrderStatus screen
Show: Google Map loads with orange highlighted route from store to customer
Show: Orange bike emoji marker moving along the route in real time
Show: ETA badge updating: "18 min" → "15 min" → "12 min"
Voiceover: "Real Google Maps. Real highlighted shortest path. Delivery partner
location updates every 3 seconds via WebSocket. This is exactly what Swiggy
shows — built with Google Directions API and live GPS simulation."

[2:00 – 2:15]  HYPERLOCAL TREND INTELLIGENCE
Show: Home page "Trending in Salt Lake This Week" section
Show: Items are specific to Kolkata neighborhood, not global trends
Voiceover: "Our Trend Agent uses real-time web search to surface what's
actually trending in your specific area of Kolkata. No global algorithm —
your neighbourhood's fashion pulse."

[2:15 – 2:45]  SELF-HEALING DEVOPS AGENT — THE SHOWSTOPPER
Show: Admin panel. "Inject Bug" clicked.
Show: Red alert: Error rate spike on /api/v1/orders/assign
Show: DevOps Agent panel activates:
  "🤖 DevOps Agent activated"
  "📁 Fetching routing code from GitLab..."
  "🧠 Asking Gemini to diagnose..."
  "🔍 Bug: lat/lon coordinates are swapped"
  "✅ Merge Request created: gitlab.com/quickstyle/..."
Show: Click link → real GitLab MR with actual code diff
Voiceover: "When Dynatrace detects an anomaly, our DevOps Agent fetches
the routing code from GitLab, asks Gemini to diagnose the bug, and
autonomously opens a merge request with the fix. An AI managing the
platform's own health."

[2:45 – 2:55]  TECH STACK MONTAGE
Quick cuts: Vertex AI console, LangGraph graph, Elasticsearch, MongoDB,
Redis Upstash, GitLab MR, Google Maps, Twilio WhatsApp notification
Voiceover: "Google Vertex AI, LangGraph, MongoDB, Elasticsearch, Redis,
Google Maps, GitLab, Dynatrace, Twilio. Eight integrations. Seven agents.
One platform that argues with itself to serve you better."

[2:55 – 3:00]  CLOSE
Show: QuickStyle logo
Voiceover: "QuickStyle. Fashion AI that actually thinks."
```

---

## APPENDIX A: QUICK START — FIRST 45 MINUTES

```bash
# 1. Clone / create project
git clone https://github.com/yourname/quickstyle
cd quickstyle

# 2. Fill environment variables
cp .env.example .env
# Fill: MONGO_URI, REDIS_URL, GEMINI_API_KEY, GOOGLE_MAPS_API_KEY,
#       TAVILY_API_KEY, GITLAB_TOKEN, TWILIO_*, RAZORPAY_*

# 3. Start all services
docker-compose up -d

# 4. Wait for Elasticsearch (~30 seconds)
docker-compose logs elasticsearch | grep "started"

# 5. Seed product catalog (with outfit_tags + fit scores)
docker-compose exec backend python scripts/seed_products.py

# 6. Build FAISS knowledge base index
docker-compose exec backend python scripts/build_faiss_index.py

# 7. Index products in Elasticsearch
docker-compose exec backend python scripts/index_products_elastic.py

# 8. Generate synthetic users (with purchase_history for proactive agent)
curl -X POST http://localhost:8000/api/v1/seed/synthetic-users

# 9. Pre-populate Kolkata area trends
curl -X POST http://localhost:8000/api/v1/seed/trends

# 10. Open app
# Customer: http://localhost:5173
# Admin:    http://localhost:5173/admin
# API docs: http://localhost:8000/docs

# 11. Test the negotiation flow
# Open customer chat, type: "yellow dress for brunch under 2000, size M"
# Watch the Admin Agent Brain terminal — negotiation should appear

# 12. Test voice input
# Open customer chat on Chrome, tap microphone, speak the same query

# 13. Test live tracking
# Place an order → go to OrderStatus page → Google Map should load + partner moves

# 14. Test DevOps agent
# Admin panel → click "Inject Bug" → watch DevOps panel → click GitLab MR link
```

## APPENDIX B: FREE RESOURCE CHECKLIST

```
✅ MongoDB Atlas M0         → mongodb.com (free forever)
✅ Upstash Redis            → upstash.com (free 10k commands/day)
✅ Elasticsearch            → elastic.co (14-day free trial)
✅ Google Cloud             → $300 free credit for new accounts
✅ Google Maps API          → $200 free credit/month
✅ Vertex AI / Gemini       → included in Google Cloud credit
✅ Google Cloud Storage     → 5GB free
✅ Tavily                   → 1,000 searches/month free
✅ GitLab                   → free tier, unlimited public repos
✅ Twilio WhatsApp          → $15 free trial credit
✅ Dynatrace                → 15-day free trial
✅ Razorpay                 → free test mode, no KYC needed
✅ Web Speech API           → browser-native, zero cost
✅ FFmpeg                   → open source, free
✅ Arize Phoenix            → local OSS, free
```

---

*QuickStyle — Final Architecture v3.0*
*7 original agents + 4 new agents = 11 total*
*Agent Negotiation · Voice Input · Live Google Maps Tracking · Smart Routing · 360° WebP Viewer · Outfit Completion · Hyperlocal Trends · Fit Confidence Badges · Proactive Reorder Agent*
*Google Cloud Rapid AI Agent Hackathon — Built to win*
