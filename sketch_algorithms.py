import cv2
import numpy as np


def classic_sketch(img, blur_intensity):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (blur_intensity, blur_intensity), sigmaX=0)
    inverted_blur = cv2.bitwise_not(blurred)
    sketch = cv2.divide(gray, inverted_blur, scale=256.0)
    return sketch


def dark_sketch(img, blur_intensity):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (blur_intensity, blur_intensity), sigmaX=0)
    inverted_blur = cv2.bitwise_not(blurred)
    sketch = cv2.divide(gray, inverted_blur, scale=256.0)
    dark = cv2.multiply(sketch, 0.6)
    return dark.astype(np.uint8)


def soft_sketch(img, blur_intensity):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (blur_intensity, blur_intensity), sigmaX=0)
    inverted_blur = cv2.bitwise_not(blurred)
    sketch = cv2.divide(gray, inverted_blur, scale=256.0)
    soft = cv2.GaussianBlur(sketch, (3, 3), sigmaX=0)
    return soft


def edge_sketch(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), sigmaX=0)
    edges = cv2.Canny(blurred, threshold1=30, threshold2=100)
    sketch = cv2.bitwise_not(edges)
    return sketch


def get_blur_value(intensity_choice):
    if intensity_choice == "1":
        return 11
    elif intensity_choice == "2":
        return 21
    elif intensity_choice == "3":
        return 41
    else:
        return 21


STYLE_FUNCTIONS = {
    "classic": classic_sketch,
    "dark": dark_sketch,
    "soft": soft_sketch,
    "edge": edge_sketch,
}

STYLE_LABELS = {
    "classic": "Classic Pencil Sketch",
    "dark": "Dark Sketch",
    "soft": "Soft Sketch",
    "edge": "Edge Sketch (Canny)",
}