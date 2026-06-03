import sys
from PIL import Image, ImageFilter

def upscale(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    # Upscale 4x
    new_size = (img.width * 4, img.height * 4)
    # Use Lanczos for high quality resampling
    img_upscaled = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Apply a slight unsharp mask to crisp up the edges
    img_sharpened = img_upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    
    img_sharpened.save(output_path)
    print("Upscaled and sharpened successfully!")

if __name__ == "__main__":
    upscale(sys.argv[1], sys.argv[2])
