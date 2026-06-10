"""
IDM-VTON Integration (yisol/IDM-VTON on Hugging Face)
Free serverless API for virtual try-on and model photo generation.
"""
import os
import asyncio
from typing import Optional, Tuple
import tempfile
from pathlib import Path

try:
    from gradio_client import Client, handle_file
    HAS_GRADIO = True
except ImportError:
    HAS_GRADIO = False


# Global client (lazy-loaded)
_vton_client: Optional['Client'] = None


def _get_vton_client() -> Optional['Client']:
    """Lazy-load IDM-VTON client."""
    global _vton_client
    if _vton_client is None and HAS_GRADIO:
        try:
            _vton_client = Client("yisol/IDM-VTON", token=os.getenv("HF_API_KEY"))
            print("[IDM-VTON] Connected to yisol/IDM-VTON space")
        except Exception as e:
            print(f"[IDM-VTON] Connection failed: {e}. Virtual try-on disabled.")
    return _vton_client


async def generate_virtual_tryon(
    person_image_path: str,
    garment_image_path: str,
    category: str = "Upper-body",
    output_dir: str = "outputs"
) -> Optional[str]:
    """
    Generate a virtual try-on image using IDM-VTON.

    Args:
        person_image_path: Path to person's photo
        garment_image_path: Path to garment image
        category: "Upper-body", "Lower-body", or "Dress"
        output_dir: Directory to save result

    Returns:
        Path to generated try-on image, or None on failure
    """
    if not HAS_GRADIO:
        print("[IDM-VTON] gradio_client not installed. Skipping try-on generation.")
        return None

    client = _get_vton_client()
    if not client:
        return None

    os.makedirs(output_dir, exist_ok=True)

    try:
        print(f"[IDM-VTON] Generating try-on for {category}...")

        result = await asyncio.to_thread(
            client.predict,
            # Person image (ImageEditor state format)
            {
                "background": handle_file(person_image_path),
                "layers": [],
                "composite": None
            },
            # Garment image
            handle_file(garment_image_path),
            # Category
            category,
            # Auto-generate mask
            True,
            # Auto-crop/align
            True,
            # Inference steps (30 = balanced quality/speed)
            30,
            # Random seed for consistency
            42,
            api_name="/tryon"
        )

        # Result is tuple: (generated_image_path, mask_path)
        generated_image_tmp = result[0] if isinstance(result, (list, tuple)) else result

        if not os.path.exists(generated_image_tmp):
            print(f"[IDM-VTON] Generated file not found: {generated_image_tmp}")
            return None

        # Move to permanent location
        import uuid
        import shutil
        filename = f"tryon_{uuid.uuid4().hex[:12]}.png"
        final_path = os.path.join(output_dir, filename)
        shutil.move(generated_image_tmp, final_path)
        print(f"[IDM-VTON] Success: {final_path}")
        return final_path

    except Exception as e:
        print(f"[IDM-VTON] Error: {e}")
        return None


async def generate_model_images_idm_vton(
    garment_image_path: str,
    description: str,
    category: str,
    output_dir: str
) -> Tuple[Optional[str], Optional[str]]:
    """
    Generate 2 model try-on images (male + female) from a garment photo.
    Uses IDM-VTON with stock male/female model photos.

    Args:
        garment_image_path: Path to garment image
        description: Garment description (for logging)
        category: Garment category for model selection
        output_dir: Directory to save results

    Returns:
        (female_model_path, male_model_path) or (None, None) on failure
    """
    if not HAS_GRADIO:
        return None, None

    client = _get_vton_client()
    if not client:
        return None, None

    os.makedirs(output_dir, exist_ok=True)

    # Stock model images (would be hosted or local)
    # For now, we'll try to use demo images if they exist
    female_model_path = None
    male_model_path = None

    try:
        # Determine category for VTON
        if "dress" in category.lower() or "skirt" in category.lower():
            vton_category = "Dress"
        elif "bottom" in category.lower() or "pant" in category.lower():
            vton_category = "Lower-body"
        else:
            vton_category = "Upper-body"

        print(f"[IDM-VTON] Generating {vton_category} model images for: {description}")

        # TODO: Ideally, you'd have stock model photos
        # For MVP, this returns None and falls back to Pollinations
        # In production, upload your own model photos to the space or use URLs

        return female_model_path, male_model_path

    except Exception as e:
        print(f"[IDM-VTON] Model generation error: {e}")
        return None, None


async def check_vton_availability() -> bool:
    """Check if IDM-VTON service is available."""
    if not HAS_GRADIO:
        print("[IDM-VTON] gradio_client not installed")
        return False

    client = _get_vton_client()
    return client is not None
