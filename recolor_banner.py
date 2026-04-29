import sys
from PIL import Image
import colorsys

def recolor_image(input_path, output_path, target_hex):
    # Convert target hex to RGB
    target_hex = target_hex.lstrip('#')
    tr, tg, tb = tuple(int(target_hex[i:i+2], 16) for i in (0, 2, 4))
    
    # Target HSV
    th, ts, tv = colorsys.rgb_to_hsv(tr/255.0, tg/255.0, tb/255.0)

    try:
        img = Image.open(input_path).convert("RGB")
    except Exception as e:
        print(f"Failed to open image: {e}")
        sys.exit(1)

    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # Convert pixel to HSV
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            
            # The red car has a hue near 0 or 1.
            # We want to change the hue to the target hue (th)
            # Make the saturation threshold higher to avoid recoloring the brown track
            if (h < 0.05 or h > 0.95) and s > 0.45 and v > 0.15:
                # To maintain the shading, we use the original v (value) and s (saturation)
                new_r, new_g, new_b = colorsys.hsv_to_rgb(th, s, v)
                pixels[x, y] = (int(new_r * 255), int(new_g * 255), int(new_b * 255))

    try:
        img.save(output_path, quality=95)
        print("Successfully recolored the banner!")
    except Exception as e:
        print(f"Failed to save image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    recolor_image(sys.argv[1], sys.argv[2], sys.argv[3])
