# process_image.py
import sys
from PIL import Image

# Get the image file path from command line arguments
image_path = sys.argv[1]

# Open and process the image
try:
    img = Image.open(image_path)
    img.show()  # Show the image
    print(f"Image {image_path} opened successfully.")
except Exception as e:
    print(f"Error opening image: {e}")
