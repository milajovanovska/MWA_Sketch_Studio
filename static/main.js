document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".showcase-card, .panel, .gallery-item")
    .forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

  function observeRevealEls() {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(el => observer.observe(el));
  }
  observeRevealEls();

  const dropzone      = document.getElementById("dropzone");
  const fileInput      = document.getElementById("file-input");
  const previewWrap    = document.getElementById("preview-wrap");
  const previewImg     = document.getElementById("preview-img");
  const previewRemove  = document.getElementById("preview-remove");

  const intensityWrap  = document.getElementById("intensity-wrap");
  const btnGenerate     = document.getElementById("btn-generate");
  const btnGenerateLabel = document.getElementById("btn-generate-label");

  const resultEmpty    = document.getElementById("result-empty");
  const resultLoading  = document.getElementById("result-loading");
  const resultReady    = document.getElementById("result-ready");
  const resultImg      = document.getElementById("result-img");
  const resultDownload = document.getElementById("result-download");
  const resultNewBtn   = document.getElementById("result-new");

  const galleryGrid    = document.getElementById("gallery-grid");
  const galleryEmpty   = document.getElementById("gallery-empty");
  const toast          = document.getElementById("toast");

  let selectedFile = null;

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      setSelectedFile(fileInput.files[0]);
    }
  });

  ["dragover", "dragleave", "drop"].forEach(evt => {
    dropzone.addEventListener(evt, (e) => e.preventDefault());
  });
  dropzone.addEventListener("dragover", () => dropzone.classList.add("dragover"));
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    dropzone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  });

  function setSelectedFile(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.");
      return;
    }
    selectedFile = file;
    previewImg.src = URL.createObjectURL(file);
    previewWrap.classList.remove("hidden");
    btnGenerate.disabled = false;
    btnGenerateLabel.textContent = "🖌 Generate sketch";
  }

  previewRemove.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    previewWrap.classList.add("hidden");
    btnGenerate.disabled = true;
    btnGenerateLabel.textContent = "Upload a photo first";
  });

  document.querySelectorAll('input[name="style"]').forEach(radio => {
    radio.addEventListener("change", () => {
      intensityWrap.classList.toggle("hidden", radio.value === "edge");
    });
  });
  const initialStyle = document.querySelector('input[name="style"]:checked');
  if (initialStyle) intensityWrap.classList.toggle("hidden", initialStyle.value === "edge");

  btnGenerate.addEventListener("click", async () => {
    if (!selectedFile) return;

    const style = document.querySelector('input[name="style"]:checked').value;
    const intensityEl = document.querySelector('input[name="intensity"]:checked');
    const intensity = intensityEl ? intensityEl.value : "2";

    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("style", style);
    formData.append("intensity", intensity);

    resultEmpty.classList.add("hidden");
    resultReady.classList.add("hidden");
    resultLoading.classList.remove("hidden");
    btnGenerate.disabled = true;

    try {
      const response = await fetch("/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (!data.ok) {
        showToast(data.error || "Something went wrong.");
        resultLoading.classList.add("hidden");
        resultEmpty.classList.remove("hidden");
        btnGenerate.disabled = false;
        return;
      }

      resultImg.src = data.entry.url;
      resultDownload.href = data.entry.url;
      resultDownload.setAttribute("download", `sketch_${data.entry.style}.png`);

      resultLoading.classList.add("hidden");
      resultReady.classList.remove("hidden");
      btnGenerate.disabled = false;

      addToGalleryGrid(data.entry, true);
      showToast("Sketch saved to your gallery ✓");

    } catch (err) {
      showToast("Could not connect to the server.");
      resultLoading.classList.add("hidden");
      resultEmpty.classList.remove("hidden");
      btnGenerate.disabled = false;
    }
  });

  resultNewBtn.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    previewWrap.classList.add("hidden");
    btnGenerate.disabled = true;
    btnGenerateLabel.textContent = "Upload a photo first";
    resultReady.classList.add("hidden");
    resultEmpty.classList.remove("hidden");
    document.getElementById("panel-upload").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  async function loadGallery() {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      galleryGrid.innerHTML = "";
      if (!data.ok || data.items.length === 0) {
        galleryEmpty.classList.remove("hidden");
        return;
      }
      galleryEmpty.classList.add("hidden");
      data.items.forEach(item => addToGalleryGrid(item, false));
    } catch (err) {
    }
  }

  function addToGalleryGrid(entry, prepend) {
    galleryEmpty.classList.add("hidden");
    const card = document.createElement("div");
    card.className = "gallery-item";
    card.dataset.id = entry.id;
    card.innerHTML = `
      <img src="${entry.url}" alt="${entry.style_label}">
      <div class="gallery-item__meta">
        <span>${entry.style_label}</span>
        <button class="gallery-item__delete" title="Delete">✕</button>
      </div>
    `;
    card.querySelector(".gallery-item__delete").addEventListener("click", () => deleteEntry(entry.id, card));

    if (prepend && galleryGrid.firstChild) {
      galleryGrid.insertBefore(card, galleryGrid.firstChild);
    } else {
      galleryGrid.appendChild(card);
    }

    requestAnimationFrame(() => card.classList.add("is-visible"));
  }

  async function deleteEntry(id, cardEl) {
    try {
      const response = await fetch(`/api/gallery/delete/${id}`, { method: "POST" });
      const data = await response.json();
      if (data.ok) {
        cardEl.remove();
        showToast("Sketch deleted.");
        if (galleryGrid.children.length === 0) galleryEmpty.classList.remove("hidden");
      } else {
        showToast(data.error || "Could not delete the sketch.");
      }
    } catch (err) {
      showToast("Could not connect to the server.");
    }
  }

  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  loadGallery();
});