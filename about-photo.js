/* About photo sizing
   The portrait is scaled from the card's bottom edge. This picks the scale
   so the top of the head lines up with the first line of the paragraph
   beside it (not the "Hi, I'm Nat!" greeting), at any width. It never goes
   below 1, so the photo always fills the card.
   Without JavaScript, or when the layout is stacked on phones, the CSS
   default scale is used. */
(() => {
  // Share of the card's height from the top of the hair to the card's bottom
  // edge at scale 1 (measured from images/me-bw-wide.jpg, which covers the
  // card by height).
  const HEAD_FRACTION = 0.5286;

  function fit(layout) {
    const card = layout.querySelector(".card");
    const img = card && card.querySelector("img");
    // French pages carry a hidden copy of the English paragraph (.lead-sizer)
    // so the photo is the same size in both languages
    const para = layout.querySelector(".lead-sizer") || layout.querySelector(".lead");
    if (!img || !para) return;

    const c = card.getBoundingClientRect();
    const p = para.getBoundingClientRect();

    // Stacked layout (paragraph below the photo): keep the CSS default
    if (p.top >= c.bottom) {
      img.style.removeProperty("--head-scale");
      return;
    }

    // Top of the capital letters on the paragraph's first line
    const cs = getComputedStyle(para);
    const fontSize = parseFloat(cs.fontSize);
    const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.45;
    const capTop = p.top + (lineHeight - fontSize) / 2;

    const scale = (c.bottom - capTop) / (HEAD_FRACTION * c.height);
    // Never below 1: smaller would expose the photo's edges inside the card
    img.style.setProperty("--head-scale", Math.min(2.2, Math.max(1, scale)).toFixed(3));
  }

  function fitAll() {
    document.querySelectorAll(".about-layout").forEach(fit);
  }

  const ro = new ResizeObserver(fitAll);
  document.querySelectorAll(".about-layout").forEach((el) => ro.observe(el));
  if (document.fonts) document.fonts.ready.then(fitAll);
  fitAll();
})();
