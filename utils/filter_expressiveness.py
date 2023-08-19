# Path to the directory containing images
import os
from tkinter import Image
from utils.color_entropy import calculate_color_entropy

# Djust this threshold based on your observation


def filter_expressiveness(images_dir, threshold=3.5):
    """Filters images based on their expressiveness.
    Args:
        images_dir The directory containing the images.
        threshold The threshold for the expressiveness.
    Returns:
        A list of filenames of images that have an expressiveness above the threshold.
    """
    filtered_images = []

    for filename in os.listdir(images_dir):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            image_path = os.path.join(images_dir, filename)
            image = Image.open(image_path)
            entropy = calculate_color_entropy(image)

            if entropy >= threshold:
                filtered_images.append(filename)

    return filtered_images
