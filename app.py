import os
import json
import uuid
from datetime import datetime

import cv2
from flask import Flask, render_template, request, jsonify, session, url_for

from sketch_algorithms import STYLE_FUNCTIONS, STYLE_LABELS, get_blur_value

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
GALLERY_FOLDER = os.path.join(BASE_DIR, "static", "gallery")
GALLERY_DB = os.path.join(BASE_DIR, "gallery_data.json")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp"}

app = Flask(__name__)
app.secret_key = "photo-sketching-mila-jovanovska-2026"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GALLERY_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_user_id():
    if "user_id" not in session:
        session["user_id"] = str(uuid.uuid4())
        session.permanent = True
    return session["user_id"]


def load_gallery():
    if not os.path.exists(GALLERY_DB):
        return []
    with open(GALLERY_DB, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_gallery(data):
    with open(GALLERY_DB, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.route("/")
def home():
    return render_template("index.html", styles=STYLE_LABELS)


@app.route("/upload", methods=["POST"])
def upload():
    if "photo" not in request.files:
        return jsonify({"ok": False, "error": "No image was sent."}), 400

    file = request.files["photo"]
    style = request.form.get("style", "classic")
    intensity = request.form.get("intensity", "2")

    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"ok": False, "error": "Invalid file type."}), 400

    if style not in STYLE_FUNCTIONS:
        return jsonify({"ok": False, "error": "Unknown sketch style."}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    temp_name = f"{uuid.uuid4().hex}.{ext}"
    temp_path = os.path.join(UPLOAD_FOLDER, temp_name)
    file.save(temp_path)

    img = cv2.imread(temp_path)
    if img is None:
        os.remove(temp_path)
        return jsonify({"ok": False, "error": "Could not read the image."}), 400

    sketch_function = STYLE_FUNCTIONS[style]
    if style == "edge":
        sketch = sketch_function(img)
    else:
        blur_value = get_blur_value(intensity)
        sketch = sketch_function(img, blur_value)

    result_name = f"{uuid.uuid4().hex}.png"
    result_path = os.path.join(GALLERY_FOLDER, result_name)
    cv2.imwrite(result_path, sketch)

    os.remove(temp_path)

    user_id = get_user_id()
    gallery = load_gallery()
    entry = {
        "id": uuid.uuid4().hex,
        "user_id": user_id,
        "filename": result_name,
        "style": style,
        "style_label": STYLE_LABELS[style],
        "created_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
    }
    gallery.append(entry)
    save_gallery(gallery)

    return jsonify({
        "ok": True,
        "entry": {
            **entry,
            "url": url_for("static", filename=f"gallery/{result_name}"),
        },
    })


@app.route("/api/gallery")
def api_gallery():
    user_id = get_user_id()
    gallery = load_gallery()
    mine = [g for g in gallery if g.get("user_id") == user_id]
    mine.sort(key=lambda g: g["id"], reverse=True)
    for g in mine:
        g["url"] = url_for("static", filename=f"gallery/{g['filename']}")
    return jsonify({"ok": True, "items": mine})


@app.route("/api/gallery/delete/<entry_id>", methods=["POST"])
def delete_entry(entry_id):
    user_id = get_user_id()
    gallery = load_gallery()
    target = next((g for g in gallery if g["id"] == entry_id and g["user_id"] == user_id), None)

    if target is None:
        return jsonify({"ok": False, "error": "Sketch not found."}), 404

    file_path = os.path.join(GALLERY_FOLDER, target["filename"])
    if os.path.exists(file_path):
        os.remove(file_path)

    gallery = [g for g in gallery if g["id"] != entry_id]
    save_gallery(gallery)

    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True, port=5000)