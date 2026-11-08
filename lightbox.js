/* Project media viewer
   Opens any image or video on a project page in a full-screen modal.
   Navigate with the arrow buttons, keyboard arrows, or by swiping.
   Escape, the close button, or clicking the dark backdrop closes it. */
(() => {
  const nodes = [
    ...document.querySelectorAll(".project-hero, .project-gallery .project-media"),
  ];
  if (!nodes.length) return;

  const items = nodes.map((el) => ({
    type: el.tagName === "VIDEO" ? "video" : "image",
    src: el.getAttribute("src"),
    alt: el.getAttribute("alt") || "",
  }));

  /* ---------- Build the modal ---------- */
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Project media viewer");
  dialog.innerHTML = `
    <div class="lightbox-stage"></div>
    <button class="icon-button lightbox-close" type="button" aria-label="Close">✕</button>
    <button class="icon-button lightbox-prev" type="button" aria-label="Previous">←</button>
    <button class="icon-button lightbox-next" type="button" aria-label="Next">→</button>
    <p class="lightbox-count" aria-live="polite"></p>
  `;
  document.body.append(dialog);

  const stage = dialog.querySelector(".lightbox-stage");
  const count = dialog.querySelector(".lightbox-count");
  let current = 0;

  function render(i) {
    current = (i + items.length) % items.length;
    const item = items[current];
    let el;
    if (item.type === "video") {
      el = document.createElement("video");
      el.src = item.src;
      el.controls = true;
      el.autoplay = true;
      el.muted = true;
      el.playsInline = true;
    } else {
      el = document.createElement("img");
      el.src = item.src;
      el.alt = item.alt;
      el.draggable = false;
    }
    stage.replaceChildren(el);
    count.textContent = `${current + 1} / ${items.length}`;

    // Warm up the neighbours so swiping feels instant
    [current - 1, current + 1].forEach((n) => {
      const next = items[(n + items.length) % items.length];
      if (next.type === "image") new Image().src = next.src;
    });
  }

  function open(i) {
    render(i);
    document.documentElement.classList.add("lightbox-open");
    dialog.showModal();
  }

  function close() {
    dialog.close();
  }

  dialog.addEventListener("close", () => {
    stage.replaceChildren(); // stops any playing video
    document.documentElement.classList.remove("lightbox-open");
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", close);
  dialog.querySelector(".lightbox-prev").addEventListener("click", () => render(current - 1));
  dialog.querySelector(".lightbox-next").addEventListener("click", () => render(current + 1));

  // Clicking the dark area around the media closes the viewer
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target === stage) close();
  });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") render(current - 1);
    if (e.key === "ArrowRight") render(current + 1);
  });

  /* ---------- Swipe ---------- */
  let startX = null;
  let startY = null;
  stage.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  stage.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      render(current + (dx < 0 ? 1 : -1));
    }
  });
  stage.addEventListener("pointercancel", () => {
    startX = startY = null;
  });

  /* ---------- Hook up the page ---------- */
  nodes.forEach((el, i) => {
    if (el.tagName === "VIDEO") {
      // Videos keep their inline controls; add an expand button on top
      const wrap = document.createElement("div");
      wrap.className = "media-video";
      wrap.style.cssText = el.style.cssText; // carries --ar for row sizing
      el.removeAttribute("style");
      el.replaceWith(wrap);
      wrap.append(el);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-button media-expand";
      btn.setAttribute("aria-label", "Open video in viewer");
      btn.textContent = "⤢";
      btn.addEventListener("click", () => {
        el.pause();
        open(i);
      });
      wrap.append(btn);
      return;
    }
    const trigger = el.closest(".media-link") || el;
    trigger.classList.add("lightbox-trigger");
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });
})();
