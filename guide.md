# Shopkeeper Guide: 360° Product Viewer Setup

Adding a new clothing item with an interactive 360° viewer using AI is a straightforward process. You do not need expensive 3D scanning equipment. Our AI handles the heavy lifting!

## Step 1: Photography (2-3 Angles)
You only need to take 2 to 3 photos of the clothing item:
1. **Front View:** A clear, well-lit head-on shot of the garment.
2. **Back View:** A clear shot of the back.
3. **Side View (Optional but recommended):** A shot from a 90-degree angle.

**Tips for best results:**
- Use a solid, neutral background (white or light grey is best).
- Keep the lighting even to avoid harsh shadows.
- Ensure the clothing is flat or worn by a mannequin.

## Step 2: AI Generation
Once you upload these 2-3 images through the Shopkeeper portal, our **Image Generation AI** takes over:
- We utilize state-of-the-art vision models (like Stable Diffusion / Zero123 / Luma AI) in the backend.
- The AI analyzes the geometry and texture of your 2D photos.
- It automatically infers the unseen angles and synthesizes **24 distinct frames**, each rotated exactly 15 degrees apart, completing a full 360-degree rotation.

## Step 3: WebP Compression & Delivery
To ensure zero latency and immediate loading for the end user:
- The 24 generated frames are compiled into a highly compressed WebP sequence.
- This is much faster and lighter than loading a true 3D `.obj` or `.gltf` file, making it perfect for the 12-minute quick-commerce speed.

## Step 4: The Interactive Viewer
When a customer views the product on their phone:
- We use a touch-gesture library (`@use-gesture/react`) attached to the image container.
- As the user swipes their finger left or right, the frontend calculates the pixel distance dragged.
- It maps that distance to an index from 0 to 23.
- The image instantly swaps to the corresponding 15-degree frame.
- **The result:** A butter-smooth, 360-degree rotation of the clothing item that feels like a real 3D object, with virtually zero load time!
