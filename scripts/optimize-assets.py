"""Create delivery assets without modifying the original artwork.

Run with Python and Pillow: python scripts/optimize-assets.py
App artwork uses lossless WebP so the screen text is preserved pixel for pixel.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageCms, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "optimized"

# source, WebP quality (None means lossless), longest allowed edge
ASSET_SETTINGS = [
    ("application-industrial-technician.png", 90, 1448),
    ("application-agro.jpg", 90, 1448),
    ("institutional-industrial.jpg", 90, 1672),
    ("skf-machining-hero.jpg", 90, 1920),
    ("skf-home-bearing.jpg", 92, 2500),
    ("bearing-exploded-realistic.png", 94, 1254),
    ("skf-authenticate-tapered.png", None, 1536),
    ("skf-chains-sueca.jpg", 92, 1280),
    ("skf-mapro-clean.png", 92, 1269),
    ("skf-lubricants.png", 92, 507),
    ("skf-system24.png", 92, 362),
    ("skf-bearing-front.png", 94, 500),
    ("skf-solid-oil-sueca.png", 92, 323),
    ("skf-bearing-group-1200.jpg", 90, 1200),
]


def main():
    OUTPUT.mkdir(exist_ok=True)
    before = after = 0
    for name, quality, edge in ASSET_SETTINGS:
        source = ASSETS / name
        destination = OUTPUT / (source.stem + ".webp")
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original)
            if image.mode == "CMYK" and original.info.get("icc_profile"):
                image = ImageCms.profileToProfile(
                    image,
                    ImageCms.ImageCmsProfile(BytesIO(original.info["icc_profile"])),
                    ImageCms.createProfile("sRGB"),
                    outputMode="RGB",
                )
            else:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            options = {"lossless": True, "exact": True} if quality is None else {"quality": quality}
            image.save(destination, "WEBP", method=6, **options)
        before += source.stat().st_size
        after += destination.stat().st_size
        print(f"{name}: {source.stat().st_size // 1024} -> {destination.stat().st_size // 1024} KiB")
    print(f"Total: {before / 1048576:.2f} -> {after / 1048576:.2f} MiB ({(1-after/before)*100:.1f}% smaller)")


if __name__ == "__main__":
    main()
