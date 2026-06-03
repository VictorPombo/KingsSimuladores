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
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Failed to open image: {e}")
        sys.exit(1)

    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            if a == 0:
                continue
                
            # Convert pixel to HSV
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            
            # Red hue is near 0 or 1. Let's say if it's primarily red
            # A pixel is reddish if it's hue is < 0.05 or > 0.95 and saturation is decent
            if (h < 0.08 or h > 0.92) and s > 0.3 and v > 0.2:
                # We want to change the hue to the target hue (th),
                # and maybe scale the saturation and value to match the target's vibrancy
                # If we just force the new hue and use the original value/saturation:
                new_r, new_g, new_b = colorsys.hsv_to_rgb(th, s * (ts/0.8) if ts > 0.5 else s, v)
                pixels[x, y] = (int(new_r * 255), int(new_g * 255), int(new_b * 255), a)

    try:
        img.save(output_path)
        print("Successfully recolored the logo!")
    except Exception as e:
        print(f"Failed to save image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    recolor_image(sys.argv[1], sys.argv[2], sys.argv[3])
