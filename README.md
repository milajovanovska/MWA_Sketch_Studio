# MWA Sketch Studio

Turn any photo into hand-drawn style pencil art, directly in the browser. Upload a picture, pick a sketch style, and get a downloadable result in seconds - no design software, no experience required.

## Features

- Upload a photo from your device or drag and drop it directly onto the page
- Four sketch styles: Classic Pencil, Dark, Soft, and Edge (Canny)
- Adjustable blur intensity for the pencil-style sketches
- Personal gallery of everything you've generated, saved per browser session
- Download any generated sketch as a PNG
- Fully responsive layout, built for both desktop and mobile

## Live Demo

https://mwa-sketch-studio.onrender.com

## Tech Stack

- **Backend:** Python, Flask
- **Image Processing:** OpenCV, NumPy
- **Frontend:** HTML, CSS, vanilla JavaScript

## Project Structure

```text
Photo_Sketching_web/
├── app.py                     # Flask application and routes
├── sketch_algorithms.py       # Image sketch generation algorithms (OpenCV)
├── requirements.txt           # Project dependencies
├── Procfile                   # Deployment configuration
├── templates/
│   └── index.html             # Main application page
├── static/
│   ├── style.css              # Application styling
│   ├── main.js                # Frontend functionality
│   ├── examples/              # Before/after example images
│   ├── gallery/               # Generated sketches (created at runtime)
│   └── uploads/               # Uploaded images (created at runtime)
└── gallery_data.json          # Gallery metadata (created at runtime)
```

## Running Locally

```bash
git clone https://github.com/<your-username>/Photo_Sketching_web.git
cd Photo_Sketching_web
pip install -r requirements.txt
python app.py
```

The app will be available at `http://127.0.0.1:5000`.

## How It Works

Each sketch style applies a different image processing technique:

- **Classic / Dark / Soft** - the photo is grayscale-converted, inverted, blurred, and blended back with the original using a dodge-blend technique, producing the pencil-like effect.
- **Edge (Canny)** - the photo is grayscale-converted and passed through Canny edge detection, producing clean outline art with no shading.

## Usage & Rights

All original photos and generated sketch examples shown on this site are protected work and may not be copied, downloaded, reposted, edited, or reused in any form without prior contact and written permission from the author.

## Author

Made by **Mila Jovanovska - Mila's World of Art**

- Instagram: [@milas_worldofart](https://www.instagram.com/milas_worldofart)
- LinkedIn: [Mila Jovanovska](https://www.linkedin.com/in/milajovanovsska/)
