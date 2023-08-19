from PIL import Image
import math
import os


def calculate_color_entropy(image):
    if isinstance(image, str):
        image = Image.open(image)
    # Convert image to RGB mode
    image_rgb = image.convert("RGB")

    # Convert image to LAB color space
    lab_image = image_rgb.convert("LAB")

    # Calculate histogram of color values
    # This calculates the histogram for each channel (L, A, B) separately
    hist = lab_image.histogram()

    # Normalize histogram
    hist = [float(h) / sum(hist) for h in hist]

    # Calculate entropy
    entropy = -sum(p * math.log(p, 2) for p in hist if p != 0)

    return entropy
